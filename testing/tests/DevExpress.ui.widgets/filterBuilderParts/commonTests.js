"use strict";

/* global fields */

var $ = require("jquery"),
    isRenderer = require("core/utils/type").isRenderer,
    config = require("core/config");

require("ui/filter_builder/filter_builder");

var FILTER_BUILDER_ITEM_FIELD_CLASS = "dx-filterbuilder-item-field",
    FILTER_BUILDER_ITEM_OPERATION_CLASS = "dx-filterbuilder-item-operation",
    FILTER_BUILDER_ITEM_VALUE_CLASS = "dx-filterbuilder-item-value",
    FILTER_BUILDER_ITEM_VALUE_TEXT_CLASS = "dx-filterbuilder-item-value-text",
    FILTER_BUILDER_GROUP_CONTENT_CLASS = "dx-filterbuilder-group-content",
    FILTER_BUILDER_IMAGE_ADD_CLASS = "dx-icon-plus",
    FILTER_BUILDER_IMAGE_REMOVE_CLASS = "dx-icon-remove",
    FILTER_BUILDER_GROUP_OPERATION_CLASS = "dx-filterbuilder-group-operation",
    ACTIVE_CLASS = "dx-state-active";

var clickByButtonAndSelectMenuItem = function($button, menuItemIndex) {
    $button.click();
    $(".dx-menu-item-text").eq(menuItemIndex).trigger("dxclick");
};

QUnit.module("Rendering", function() {
    QUnit.test("markup init", function(assert) {
        var $etalon = $("<div/>").html(
            '<div id="container" class="dx-filterbuilder dx-widget">'
                + '<div class="dx-filterbuilder-group">'
                    + '<div class="dx-filterbuilder-group-item">'
                        + '<div class="dx-filterbuilder-text dx-filterbuilder-group-operation" tabindex="0">And</div>'
                        + '<div class="dx-filterbuilder-action-icon dx-icon-plus dx-filterbuilder-action" tabindex="0"></div>'
                    + '</div>'
                    + '<div class="dx-filterbuilder-group-content"></div>'
                + '</div>'
            + '</div>'
        );

        var element = $("#container").dxFilterBuilder();
        assert.equal(element.parent().html(), $etalon.html());
    });

    QUnit.test("filterbuilder is created by different values", function(assert) {
        var instance = $("#container").dxFilterBuilder({
            fields: fields
        }).dxFilterBuilder("instance");

        try {
            instance.option("value", null);
            instance.option("value", []);
            instance.option("value", ["Or"]);
            instance.option("value", ["!", [["CompanyName", "=", "DevExpress"], ["CompanyName", "=", "DevExpress"]]]);
            instance.option("value", ["!", ["CompanyName", "=", "DevExpress"]]);
            instance.option("value", ["CompanyName", "=", "K&S Music"]);
            instance.option("value", ["CompanyName", "K&S Music"]);
            instance.option("value", [["CompanyName", "=", "K&S Music"], ["CompanyName", "=", "K&S Music"]]);
            instance.option("value", [[["CompanyName", "=", "K&S Music"], "Or"], "And"]);
            assert.ok(true, "all values were approved");
        } catch(e) {
            assert.ok(false, e);
        }
    });

    QUnit.test("filter Content init by one condition", function(assert) {
        var $etalon = $("<div/>").html(
            '<div class=\"dx-filterbuilder-group\">'
                + '<div class=\"dx-filterbuilder-group-item\">'
                    + '<div class=\"dx-filterbuilder-action-icon dx-icon-remove dx-filterbuilder-action\" tabindex=\"0\"></div>'
                    + '<div class="dx-filterbuilder-text dx-filterbuilder-group-operation" tabindex="0">Or</div>'
                    + '<div class="dx-filterbuilder-action-icon dx-icon-plus dx-filterbuilder-action" tabindex="0"></div>'
                + '</div>'
                + '<div class="dx-filterbuilder-group-content">'
                    + '<div class="dx-filterbuilder-group">'
                        + '<div class=\"dx-filterbuilder-group-item\">'
                            + '<div class=\"dx-filterbuilder-action-icon dx-icon-remove dx-filterbuilder-action\" tabindex=\"0\"></div>'
                            + '<div class=\"dx-filterbuilder-text dx-filterbuilder-item-field\" tabindex=\"0\">Company Name</div>'
                            + '<div class=\"dx-filterbuilder-text dx-filterbuilder-item-operation\" tabindex=\"0\">Equals</div>'
                            + '<div class=\"dx-filterbuilder-text dx-filterbuilder-item-value\">'
                                + '<div class=\"dx-filterbuilder-item-value-text\" tabindex=\"0\">K&amp;S Music</div>'
                            + '</div>'
                        + '</div>'
                    + '</div>'
                + '</div>'
            + '</div>'
        );

        var element = $("#container").dxFilterBuilder({
            fields: fields,
            value: [[["CompanyName", "=", "K&S Music"], "Or"], "And"]
        });
        assert.equal(element.find("." + FILTER_BUILDER_GROUP_CONTENT_CLASS).html(), $etalon.html());
    });

    QUnit.test("filter Content init by several conditions", function(assert) {
        var $etalon = $("<div/>").html(
            '<div class="dx-filterbuilder-group">'
                + '<div class=\"dx-filterbuilder-group-item\">'
                    + '<div class=\"dx-filterbuilder-action-icon dx-icon-remove dx-filterbuilder-action\" tabindex=\"0\"></div>'
                    + '<div class=\"dx-filterbuilder-text dx-filterbuilder-item-field\" tabindex=\"0\">Company Name</div>'
                    + '<div class=\"dx-filterbuilder-text dx-filterbuilder-item-operation\" tabindex=\"0\">Equals</div>'
                    + '<div class=\"dx-filterbuilder-text dx-filterbuilder-item-value\">'
                        + '<div class=\"dx-filterbuilder-item-value-text\" tabindex=\"0\">K&amp;S Music</div>'
                    + '</div>'
                + '</div>'
            + '</div>'
            + '<div class="dx-filterbuilder-group">'
                + '<div class=\"dx-filterbuilder-group-item\">'
                    + '<div class=\"dx-filterbuilder-action-icon dx-icon-remove dx-filterbuilder-action\" tabindex=\"0\"></div>'
                    + '<div class=\"dx-filterbuilder-text dx-filterbuilder-item-field\" tabindex=\"0\">Zipcode</div>'
                    + '<div class=\"dx-filterbuilder-text dx-filterbuilder-item-operation\" tabindex=\"0\">Equals</div>'
                    + '<div class=\"dx-filterbuilder-text dx-filterbuilder-item-value\">'
                        + '<div class=\"dx-filterbuilder-item-value-text\" tabindex=\"0\">98027</div>'
                    + '</div>'
                + '</div>'
            + '</div>'
        );

        var element = $("#container").dxFilterBuilder({
            fields: fields,
            value: [["CompanyName", "=", "K&S Music"], "or", ["Zipcode", "=", "98027"]]
        });
        assert.equal(element.find("." + FILTER_BUILDER_GROUP_CONTENT_CLASS).html(), $etalon.html());
    });

    QUnit.test("value and operations depend on selected field", function(assert) {
        var container = $("#container");

        container.dxFilterBuilder({
            allowHierarchicalFields: true,
            value: [
                ["CompanyName", "=", "K&S Music"]
            ],
            fields: fields
        });

        var $fieldButton = container.find("." + FILTER_BUILDER_ITEM_FIELD_CLASS);
        $fieldButton.click();
        assert.ok($fieldButton.hasClass(ACTIVE_CLASS));

        assert.ok($(".dx-filterbuilder-fields").length > 0);

        var $menuItem = $(".dx-treeview-item").eq(2);
        assert.equal($menuItem.text(), "State");
        $menuItem.trigger("dxclick");
        assert.equal($fieldButton.html(), "State");
        assert.ok(!$fieldButton.hasClass(ACTIVE_CLASS));
        assert.equal(container.find("." + FILTER_BUILDER_ITEM_OPERATION_CLASS).text(), "Contains");
        assert.equal(container.find("." + FILTER_BUILDER_ITEM_VALUE_CLASS).text(), "<enter a value>");
        assert.ok($(".dx-filterbuilder-fields").length === 0);
    });

    QUnit.test("editorElement argument of onEditorPreparing option is correct", function(assert) {
        var container = $("#container"),
            companyNameValueField;

        container.dxFilterBuilder({
            value: [
                ["CompanyName", "=", "DevExpress"]
            ],
            onEditorPreparing: function(e) {
                assert.equal(isRenderer(e.editorElement), config().useJQuery, "editorElement is correct");
            },
            fields: fields
        });

        //act
        companyNameValueField = $("." + FILTER_BUILDER_ITEM_VALUE_CLASS).eq(0);
        companyNameValueField.find("." + FILTER_BUILDER_ITEM_VALUE_TEXT_CLASS).click();
    });

    QUnit.test("operations are changed after field change", function(assert) {
        var container = $("#container");

        container.dxFilterBuilder({
            allowHierarchicalFields: true,
            value: [
                ["State", "<>", "K&S Music"]
            ],
            fields: fields
        });

        assert.equal(container.find("." + FILTER_BUILDER_ITEM_OPERATION_CLASS).text(), "Does not equal");

        var $fieldButton = container.find("." + FILTER_BUILDER_ITEM_FIELD_CLASS);
        $fieldButton.click();

        var $menuItem = $(".dx-treeview-item").eq(5);
        $menuItem.trigger("dxclick");

        assert.equal($fieldButton.html(), "City");
        assert.equal(container.find("." + FILTER_BUILDER_ITEM_OPERATION_CLASS).text(), "Equals");
    });

    QUnit.test("selected element must change in field menu after click", function(assert) {
        var container = $("#container");

        container.dxFilterBuilder({
            value: [
                ["State", "<>", "K&S Music"]
            ],
            fields: fields
        });

        var $fieldButton = container.find("." + FILTER_BUILDER_ITEM_FIELD_CLASS);
        $fieldButton.click();

        assert.equal($(".dx-menu-item-selected").text(), "State");

        var $menuItem = $(".dx-menu-item-text").eq(1);
        $menuItem.trigger("dxclick");

        $fieldButton.click();
        assert.equal($(".dx-menu-item-selected").text(), "Date");
    });

    QUnit.test("selected element must change in group operation menu after click", function(assert) {
        var container = $("#container");

        container.dxFilterBuilder({
            value: [
                ["State", "<>", "K&S Music"]
            ],
            fields: fields
        });

        var $groupButton = container.find("." + FILTER_BUILDER_GROUP_OPERATION_CLASS);
        $groupButton.click();

        assert.ok($(".dx-filterbuilder-group-operations").length > 0);
        assert.equal($(".dx-menu-item-selected").text(), "And");

        var $menuItem = $(".dx-menu-item-text").eq(3);
        $menuItem.trigger("dxclick");

        assert.ok($(".dx-filterbuilder-group-operations").length === 0);

        $groupButton.click();
        assert.equal($(".dx-menu-item-selected").text(), "Not Or");
    });

    QUnit.test("selected element must change in filter operation menu after click", function(assert) {
        var container = $("#container");

        container.dxFilterBuilder({
            value: [
                ["Date", "=", ""]
            ],
            fields: fields
        });

        var $operationButton = container.find("." + FILTER_BUILDER_ITEM_OPERATION_CLASS);
        $operationButton.click();

        assert.ok($(".dx-filterbuilder-operations").length > 0);
        assert.equal($(".dx-menu-item-selected").text(), "Equals");

        var $menuItem = $(".dx-menu-item-text").eq(3);
        $menuItem.trigger("dxclick");

        assert.ok($(".dx-filterbuilder-operations").length === 0);
        assert.equal(container.find("." + FILTER_BUILDER_ITEM_VALUE_CLASS).length, 1);

        $operationButton.click();
        assert.equal($(".dx-menu-item-selected").text(), "Greater than");
    });

    QUnit.test("hide value field for isblank & isNotBlank", function(assert) {
        var container = $("#container");

        container.dxFilterBuilder({
            value: [
                ["State", "<>", "K&S Music"]
            ],
            fields: fields
        });

        assert.equal(container.find("." + FILTER_BUILDER_ITEM_VALUE_CLASS).length, 1);

        // for is blank
        var $operationButton = container.find("." + FILTER_BUILDER_ITEM_OPERATION_CLASS);

        clickByButtonAndSelectMenuItem($operationButton, 6);
        assert.equal($operationButton.text(), "Is blank");
        assert.equal(container.find("." + FILTER_BUILDER_ITEM_VALUE_CLASS).length, 0);

        clickByButtonAndSelectMenuItem($operationButton, 5);
        assert.equal($operationButton.text(), "Does not equal");
        assert.equal(container.find("." + FILTER_BUILDER_ITEM_VALUE_CLASS).length, 1);

        // for is not blank
        clickByButtonAndSelectMenuItem($operationButton, 7);
        assert.equal($operationButton.text(), "Is not blank");
        assert.equal(container.find("." + FILTER_BUILDER_ITEM_VALUE_CLASS).length, 0);

        clickByButtonAndSelectMenuItem($operationButton, 4);
        assert.equal($operationButton.text(), "Equals");
        assert.equal(container.find("." + FILTER_BUILDER_ITEM_VALUE_CLASS).length, 1);
    });

    QUnit.test("hide filter value for field with object dataType", function(assert) {
        var container = $("#container");

        container.dxFilterBuilder({
            value: [
                ["State", "<>", "K&S Music"]
            ],
            fields: fields
        });

        var $fieldButton = container.find("." + FILTER_BUILDER_ITEM_FIELD_CLASS);

        clickByButtonAndSelectMenuItem($fieldButton, 6);
        assert.equal($fieldButton.text(), "Caption of Object Field");
        assert.equal(container.find("." + FILTER_BUILDER_ITEM_VALUE_CLASS).length, 0);

        clickByButtonAndSelectMenuItem($fieldButton, 2);
        assert.equal($fieldButton.text(), "State");
        assert.equal(container.find("." + FILTER_BUILDER_ITEM_VALUE_CLASS).length, 1);
    });

    QUnit.testInActiveWindow("change filter value", function(assert) {
        var container = $("#container"),
            instance = container.dxFilterBuilder({
                allowHierarchicalFields: true,
                value: ["State", "<>", "K&S Music"],
                fields: fields
            }).dxFilterBuilder("instance");

        var $valueButton = container.find("." + FILTER_BUILDER_ITEM_VALUE_TEXT_CLASS);
        $valueButton.click();

        var $textBoxContainer = container.find("." + FILTER_BUILDER_ITEM_VALUE_CLASS + " .dx-textbox"),
            textBoxInstance = $textBoxContainer.dxTextBox("instance"),
            $input = $textBoxContainer.find("input");
        assert.ok($input.is(":focus"));

        textBoxInstance.option("value", "Test");
        $input.trigger("blur");
        assert.notOk(container.find("input").length, "hasn't input");
        assert.deepEqual(instance._model, [["State", "<>", "Test"]]);
        assert.deepEqual(instance.option("value"), ["State", "<>", "Test"]);
    });

    QUnit.testInActiveWindow("change filter value in selectbox", function(assert) {
        var $container = $("#container"),
            instance = $container.dxFilterBuilder({
                allowHierarchicalFields: true,
                value: ["CompanyName", "<>", "KS Music"],
                fields: fields
            }).dxFilterBuilder("instance");

        var $valueButton = $container.find("." + FILTER_BUILDER_ITEM_VALUE_TEXT_CLASS);
        $valueButton.click();

        var $input = $container.find("." + FILTER_BUILDER_ITEM_VALUE_CLASS).find("input");
        assert.ok($input.is(":focus"));

        var selectBoxInstance = $container.find(".dx-selectbox").dxSelectBox("instance");
        selectBoxInstance.open();
        $(".dx-list-item").eq(2).trigger("dxclick");
        assert.ok($input.is(":focus"));

        selectBoxInstance.blur();
        assert.notOk($container.find("input").length, "hasn't input");
        assert.deepEqual(instance.option("value"), ["CompanyName", "<>", "Super Mart of the West"]);

    });

    QUnit.testInActiveWindow("check default value for number", function(assert) {
        var container = $("#container"),
            instance = container.dxFilterBuilder({
                allowHierarchicalFields: true,
                value: ["Zipcode", "<>", 123],
                fields: fields
            }).dxFilterBuilder("instance");

        container.find("." + FILTER_BUILDER_ITEM_VALUE_TEXT_CLASS).click();

        var $editorContainer = container.find("." + FILTER_BUILDER_ITEM_VALUE_CLASS + " > div"),
            editorInstance = $editorContainer.dxNumberBox("instance"),
            $input = $editorContainer.find("input");
        editorInstance.option("value", 0);
        $input.trigger("blur");
        assert.deepEqual(instance.option("value"), ["Zipcode", "<>", 0]);
    });

    QUnit.testInActiveWindow("change filter value when specified editorTemplate", function(assert) {
        var container = $("#container"),
            instance = container.dxFilterBuilder({
                value: ["Field", "=", "Test1"],
                fields: [{
                    dataField: "Field",
                    editorTemplate: function(options, $container) {
                        $("<input/>").val(options.val).on("change", function(e) {
                            options.setValue($(e.currentTarget).val());
                        }).appendTo($container);
                    }
                }]
            }).dxFilterBuilder("instance");

        var $valueButton = container.find("." + FILTER_BUILDER_ITEM_VALUE_TEXT_CLASS);
        assert.strictEqual($valueButton.text(), "Test1", "filter value");

        $valueButton.click();

        var $input = container.find("input");
        assert.ok($input.is(":focus"));

        $input.val("Test2");
        $input.trigger("change");
        $input.trigger("blur");

        $valueButton = container.find("." + FILTER_BUILDER_ITEM_VALUE_TEXT_CLASS);
        assert.strictEqual($valueButton.text(), "Test2", "filter value");
        assert.deepEqual(instance._model, [["Field", "=", "Test2"]]);
        assert.deepEqual(instance.option("value"), ["Field", "=", "Test2"]);
        assert.notOk(container.find("input").length, "hasn't input");
    });

    QUnit.test("Add and remove condition", function(assert) {
        var container = $("#container"),
            instance = container.dxFilterBuilder({
                allowHierarchicalFields: true,
                value: ["State", "<>", "Test"],
                fields: fields
            }).dxFilterBuilder("instance");

        $("." + FILTER_BUILDER_IMAGE_ADD_CLASS).click();

        assert.ok($(".dx-filterbuilder-add-condition").length > 0);

        $(".dx-menu-item-text").eq(0).trigger("dxclick");

        assert.ok($(".dx-filterbuilder-add-condition").length === 0);
        assert.deepEqual(instance._model, [["State", "<>", "Test"], ["CompanyName", "contains", ""]]);
        assert.deepEqual(instance.option("value"), [["State", "<>", "Test"], ["CompanyName", "contains", ""]]);

        $("." + FILTER_BUILDER_IMAGE_REMOVE_CLASS).eq(1).click();
        assert.deepEqual(instance._model, [["State", "<>", "Test"]]);
        assert.deepEqual(instance.option("value"), ["State", "<>", "Test"]);
        assert.notEqual(instance.option("value"), instance._model[0]);
    });

    QUnit.test("Add and remove group", function(assert) {
        var container = $("#container"),
            instance = container.dxFilterBuilder({
                allowHierarchicalFields: true,
                value: ["State", "<>", "Test"],
                fields: fields
            }).dxFilterBuilder("instance");

        clickByButtonAndSelectMenuItem($("." + FILTER_BUILDER_IMAGE_ADD_CLASS), 1);
        assert.deepEqual(instance._model, [["State", "<>", "Test"], ["and"]]);
        assert.deepEqual(instance.option("value"), ["State", "<>", "Test"]);

        $("." + FILTER_BUILDER_IMAGE_REMOVE_CLASS).eq(1).click();
        assert.deepEqual(instance._model, [["State", "<>", "Test"]]);
        assert.deepEqual(instance.option("value"), ["State", "<>", "Test"]);
        assert.notEqual(instance.option("value"), instance._model[0]);
    });

    QUnit.test("show editor on keyup event", function(assert) {
        var container = $("#container");

        container.dxFilterBuilder({
            value: ["Zipcode", "<>", 123],
            fields: fields
        });

        var $valueButton = container.find("." + FILTER_BUILDER_ITEM_VALUE_TEXT_CLASS);
        $valueButton.trigger($.Event("keyup", { keyCode: 13 }));

        assert.notOk(container.find("." + FILTER_BUILDER_ITEM_VALUE_TEXT_CLASS).length);
        assert.ok(container.find(".dx-texteditor").length);
    });
});

QUnit.module("Create editor by field dataType", function() {
    QUnit.test("number", function(assert) {
        var container = $("#container");

        container.dxFilterBuilder({
            allowHierarchicalFields: true,
            value: ["Zipcode", "=", 98027],
            fields: fields
        });
        var valueField = $("." + FILTER_BUILDER_ITEM_VALUE_CLASS).eq(0);
        valueField.find("." + FILTER_BUILDER_ITEM_VALUE_TEXT_CLASS).click();
        assert.ok(valueField.find(".dx-numberbox").dxNumberBox("instance"));
    });

    QUnit.test("string", function(assert) {
        var container = $("#container");

        container.dxFilterBuilder({
            allowHierarchicalFields: true,
            value: ["State", "=", "Test"],
            fields: fields
        });

        var valueField = $("." + FILTER_BUILDER_ITEM_VALUE_CLASS).eq(0);
        valueField.find("." + FILTER_BUILDER_ITEM_VALUE_TEXT_CLASS).click();
        assert.ok(valueField.find(".dx-textbox").dxTextBox("instance"));
    });

    QUnit.test("date", function(assert) {
        var container = $("#container"),
            dateBoxInstance;

        container.dxFilterBuilder({
            allowHierarchicalFields: true,
            value: ["Date", "=", new Date()],
            fields: fields
        });

        var valueField = $("." + FILTER_BUILDER_ITEM_VALUE_CLASS).eq(0);
        valueField.find("." + FILTER_BUILDER_ITEM_VALUE_TEXT_CLASS).click();
        dateBoxInstance = valueField.find(".dx-datebox").dxDateBox("instance");
        assert.strictEqual(dateBoxInstance.option("type"), "date");
    });

    QUnit.test("datetime", function(assert) {
        var container = $("#container"),
            dateBoxInstance;

        container.dxFilterBuilder({
            allowHierarchicalFields: true,
            value: ["DateTime", "=", new Date()],
            fields: fields
        });

        var valueField = $("." + FILTER_BUILDER_ITEM_VALUE_CLASS).eq(0);
        valueField.find("." + FILTER_BUILDER_ITEM_VALUE_TEXT_CLASS).click();
        dateBoxInstance = valueField.find(".dx-datebox").dxDateBox("instance");
        assert.strictEqual(dateBoxInstance.option("type"), "datetime");
    });

    QUnit.test("boolean", function(assert) {
        var container = $("#container");

        container.dxFilterBuilder({
            allowHierarchicalFields: true,
            value: ["Contributor", "=", false],
            fields: fields
        });

        var valueField = $("." + FILTER_BUILDER_ITEM_VALUE_CLASS).eq(0);
        valueField.find("." + FILTER_BUILDER_ITEM_VALUE_TEXT_CLASS).click();
        assert.ok(valueField.find(".dx-selectbox").dxSelectBox("instance"));
    });

    QUnit.test("object", function(assert) {
        var container = $("#container");

        container.dxFilterBuilder({
            allowHierarchicalFields: true,
            value: ["ObjectField", "=", null],
            fields: fields
        });

        var valueField = $("." + FILTER_BUILDER_ITEM_VALUE_CLASS).eq(0);
        assert.notOk(valueField.length);
    });

    QUnit.test("field with lookup", function(assert) {
        var container = $("#container");

        container.dxFilterBuilder({
            allowHierarchicalFields: true,
            value: ["CompanyName", "=", "Test"],
            fields: fields
        });

        var valueField = $("." + FILTER_BUILDER_ITEM_VALUE_CLASS).eq(0);
        valueField.find("." + FILTER_BUILDER_ITEM_VALUE_TEXT_CLASS).click();
        assert.ok(valueField.find(".dx-selectbox").dxSelectBox("instance"));
    });

    QUnit.test("editorTemplate", function(assert) {
        var args,
            fields = [{
                dataField: "Field",
                editorTemplate: function(options, $container) {
                    args = options;

                    return $("<input/>").addClass("my-editor");
                }
            }];

        $("#container").dxFilterBuilder({
            value: [
                ["Field", "=", "value"]
            ],
            fields: fields
        });

        var valueField = $("." + FILTER_BUILDER_ITEM_VALUE_CLASS).eq(0);
        valueField.find("." + FILTER_BUILDER_ITEM_VALUE_TEXT_CLASS).click();
        assert.ok(valueField.find("input").hasClass("my-editor"));

        assert.strictEqual(args.value, "value", "filter value");
        assert.strictEqual(args.filterOperation, "=", "filter operation");
        assert.deepEqual(args.field, fields[0], "field");
        assert.ok(args.setValue, "has setValue");
    });
});

QUnit.module("Short condition", function() {
    QUnit.test("check value field", function(assert) {
        var container = $("#container");

        container.dxFilterBuilder({
            value: ["CompanyName", "K&S Music"],
            fields: fields
        });

        assert.equal(container.find("." + FILTER_BUILDER_ITEM_VALUE_TEXT_CLASS).text(), "K&S Music");
    });

    QUnit.test("check value input", function(assert) {
        var container = $("#container");

        container.dxFilterBuilder({
            value: ["CompanyName", "K&S Music"],
            fields: fields
        });

        container.find("." + FILTER_BUILDER_ITEM_VALUE_TEXT_CLASS).click();

        assert.equal(container.find("input").val(), "K&S Music");
    });

    QUnit.test("check value field after change of operation field", function(assert) {
        var container = $("#container"),
            instance = container.dxFilterBuilder({
                value: ["CompanyName", "K&S Music"],
                fields: fields
            }).dxFilterBuilder("instance");

        container.find("." + FILTER_BUILDER_ITEM_OPERATION_CLASS).click();
        $(".dx-menu-item-text").eq(3).trigger("dxclick");

        assert.equal(container.find("." + FILTER_BUILDER_ITEM_VALUE_TEXT_CLASS).text(), "K&S Music");
        assert.deepEqual(instance.option("value"), ["CompanyName", "endswith", "K&S Music"]);
    });

    QUnit.test("check value input after change of operation field", function(assert) {
        var container = $("#container");

        container.dxFilterBuilder({
            value: ["CompanyName", "K&S Music"],
            fields: fields
        });

        container.find("." + FILTER_BUILDER_ITEM_OPERATION_CLASS).click();
        $(".dx-menu-item-text").eq(3).trigger("dxclick");
        container.find("." + FILTER_BUILDER_ITEM_VALUE_TEXT_CLASS).click();

        assert.equal(container.find("input").val(), "K&S Music");
    });
});

QUnit.module("on value changed", function() {
    var changeValueAndTriggerEvent = function(container, newValue, event) {
        container.find("." + FILTER_BUILDER_ITEM_VALUE_TEXT_CLASS).click();
        var $textBoxContainer = container.find("." + FILTER_BUILDER_ITEM_VALUE_CLASS + " .dx-textbox"),
            textBoxInstance = $textBoxContainer.dxTextBox("instance");
        textBoxInstance.option("value", "Test");
        $textBoxContainer.find("input").trigger(event);
    };

    QUnit.test("add/remove empty group", function(assert) {
        var container = $("#container"),
            value = [["CompanyName", "K&S Music"]],
            instance = container.dxFilterBuilder({
                value: value,
                fields: fields
            }).dxFilterBuilder("instance");

        // add empty group
        value = instance.option("value");
        clickByButtonAndSelectMenuItem($("." + FILTER_BUILDER_IMAGE_ADD_CLASS).eq(1), 0);
        assert.equal(instance.option("value"), value);

        // remove empty group
        value = instance.option("value");
        clickByButtonAndSelectMenuItem($("." + FILTER_BUILDER_IMAGE_REMOVE_CLASS).eq(2), 0);
        assert.equal(instance.option("value"), value);

    });

    QUnit.test("add/remove group with condition", function(assert) {
        var container = $("#container"),
            value = [["CompanyName", "K&S Music"]],
            instance = container.dxFilterBuilder({
                value: value,
                fields: fields
            }).dxFilterBuilder("instance");

        // add group
        value = instance.option("value");
        clickByButtonAndSelectMenuItem($("." + FILTER_BUILDER_IMAGE_ADD_CLASS), 1);
        assert.equal(instance.option("value"), value);

        // add inner condition
        value = instance.option("value");
        clickByButtonAndSelectMenuItem($("." + FILTER_BUILDER_IMAGE_ADD_CLASS).eq(1), 0);
        assert.notEqual(instance.option("value"), value);

        //remove group
        value = instance.option("value");
        clickByButtonAndSelectMenuItem($("." + FILTER_BUILDER_IMAGE_REMOVE_CLASS).eq(1), 0);
        assert.notEqual(instance.option("value"), value);

    });

    QUnit.test("add/remove conditions", function(assert) {
        var container = $("#container"),
            value = [["CompanyName", "K&S Music"]],
            instance = container.dxFilterBuilder({
                value: value,
                fields: fields
            }).dxFilterBuilder("instance");

        // add condition
        clickByButtonAndSelectMenuItem($("." + FILTER_BUILDER_IMAGE_ADD_CLASS), 0);

        assert.notEqual(instance.option("value"), value);

        //remove condition
        value = instance.option("value");
        clickByButtonAndSelectMenuItem($("." + FILTER_BUILDER_IMAGE_REMOVE_CLASS).eq(1), 0);

        assert.notEqual(instance.option("value"), value);
    });

    QUnit.test("add/remove not valid conditions", function(assert) {
        var container = $("#container"),
            value = [["Zipcode", ""]],
            instance = container.dxFilterBuilder({
                value: value,
                fields: [fields[3]]
            }).dxFilterBuilder("instance");

        // add condition
        clickByButtonAndSelectMenuItem($("." + FILTER_BUILDER_IMAGE_ADD_CLASS), 0);

        assert.equal(instance.option("value"), value);

        //remove condition
        value = instance.option("value");
        clickByButtonAndSelectMenuItem($("." + FILTER_BUILDER_IMAGE_REMOVE_CLASS).eq(1), 0);

        assert.equal(instance.option("value"), value);
    });

    QUnit.test("change condition field", function(assert) {
        var container = $("#container"),
            value = [["CompanyName", "K&S Music"]],
            instance = container.dxFilterBuilder({
                value: value,
                fields: fields
            }).dxFilterBuilder("instance");

        clickByButtonAndSelectMenuItem($("." + FILTER_BUILDER_ITEM_FIELD_CLASS), 2);

        assert.notEqual(instance.option("value"), value);

        value = instance.option("value");
        clickByButtonAndSelectMenuItem($("." + FILTER_BUILDER_ITEM_FIELD_CLASS), 2);

        assert.equal(instance.option("value"), value);
    });

    QUnit.test("change condition operation", function(assert) {
        var container = $("#container"),
            value = [["CompanyName", "K&S Music"]],
            instance = container.dxFilterBuilder({
                value: value,
                fields: fields
            }).dxFilterBuilder("instance");

        clickByButtonAndSelectMenuItem($("." + FILTER_BUILDER_ITEM_OPERATION_CLASS), 2);

        assert.notEqual(instance.option("value"), value);

        value = instance.option("value");
        clickByButtonAndSelectMenuItem($("." + FILTER_BUILDER_ITEM_OPERATION_CLASS), 2);

        assert.equal(instance.option("value"), value);
    });

    QUnit.testInActiveWindow("change condition value by focusout", function(assert) {
        var container = $("#container"),
            value = [["State", "=", ""]],
            instance = container.dxFilterBuilder({
                value: value,
                fields: fields
            }).dxFilterBuilder("instance");

        changeValueAndTriggerEvent(container, "Test", "blur");

        assert.notEqual(instance.option("value"), value);
        assert.equal(container.find("." + FILTER_BUILDER_ITEM_VALUE_TEXT_CLASS).length, 1);

        value = instance.option("value");

        changeValueAndTriggerEvent(container, "Test", "blur");

        assert.equal(instance.option("value"), value);
        assert.equal(container.find("." + FILTER_BUILDER_ITEM_VALUE_TEXT_CLASS).length, 1);
    });

    QUnit.test("condition isn't changed after escape click", function(assert) {
        var container = $("#container"),
            value = [["State", "=", ""]],
            instance = container.dxFilterBuilder({
                value: value,
                fields: fields
            }).dxFilterBuilder("instance");

        container.find("." + FILTER_BUILDER_ITEM_VALUE_TEXT_CLASS).click();

        changeValueAndTriggerEvent(container, "Test", $.Event("keyup", { keyCode: 27 }));

        assert.equal(instance.option("value"), value);
        assert.equal(container.find("." + FILTER_BUILDER_ITEM_VALUE_TEXT_CLASS).length, 1);
    });

    QUnit.test("change condition value by enter click", function(assert) {
        var container = $("#container"),
            value = [["State", "=", ""]],
            instance = container.dxFilterBuilder({
                value: value,
                fields: fields
            }).dxFilterBuilder("instance");

        changeValueAndTriggerEvent(container, "Test", $.Event("keyup", { keyCode: 13 }));

        assert.notEqual(instance.option("value"), value);
        assert.equal(container.find("." + FILTER_BUILDER_ITEM_VALUE_TEXT_CLASS).length, 1);

        value = instance.option("value");

        changeValueAndTriggerEvent(container, "Test", $.Event("keyup", { keyCode: 13 }));

        assert.equal(instance.option("value"), value);
        assert.equal(container.find("." + FILTER_BUILDER_ITEM_VALUE_TEXT_CLASS).length, 1);
    });
});
