(function (global, factory) {
    global.CustomSelect = factory();
}(this, (function () {

    let CustomSelect = {};

    CustomSelect.select = function (object) {
        let obj = this;
        this.nativeSelectElem = object;
        this.customSelectElem = document.createElement("div");
        this.customSelectTriggerElem = document.createElement("div");
        this.customSelectOptionsOuterWrapElem = document.createElement("div");
        this.customSelectOptionsWrapElem = document.createElement("div");
        this.nativeSelectElem.classList.add("select-native");
        this.customSelectElem.classList.add("select-custom");
        this.customSelectTriggerElem.classList.add("select-custom-trigger");
        this.customSelectOptionsOuterWrapElem.classList.add("select-custom-options-wrap");
        this.customSelectOptionsWrapElem.classList.add("select-custom-options");

        this.customSelectElem.appendChild(this.customSelectTriggerElem);
        this.customSelectElem.appendChild(this.customSelectOptionsOuterWrapElem);
        this.customSelectOptionsOuterWrapElem.appendChild(this.customSelectOptionsWrapElem);

        this.nativeOptions = this.nativeSelectElem.children;
        this.nativeOptionsList = Array.from(this.nativeOptions);
        this.optionsCount = this.nativeOptionsList.length;

        this.nativeOptionsList.forEach(function (optElem) {
            let customOption = document.createElement("div");
            customOption.classList.add("select-custom-option");
            customOption.innerHTML = optElem.text;
            if (optElem.value != '') {
                customOption.setAttribute('data-value', optElem.value);
                obj.customSelectOptionsWrapElem.appendChild(customOption);
            }
        });

        this.customOptions = this.customSelectOptionsWrapElem.children;
        this.customOptionsList = Array.from(this.customOptions);

        this.nativeSelectElem.after(this.customSelectElem);
        this.optionChecked = "";
        this.optionHoveredIndex = -1;

        this.watchClickOutside = function (e) {
            let didClickedOutside = !obj.customSelectElem.contains(event.target);
            if (didClickedOutside) {
                obj.closeSelectCustom();
            }
        };

        this.supportKeyboardNavigation = function (e) {
            if (event.keyCode === 40 && obj.optionHoveredIndex < obj.optionsCount - 1) {
                let index = obj.optionHoveredIndex;
                e.preventDefault();
                obj.updateCustomSelectHovered(obj.optionHoveredIndex + 1);
            }

            if (event.keyCode === 38 && obj.optionHoveredIndex > 0) {
                e.preventDefault();
                obj.updateCustomSelectHovered(obj.optionHoveredIndex - 1);
            }

            if (event.keyCode === 13 || event.keyCode === 32) {
                e.preventDefault();

                let option = obj.customSelectOptionsWrapElem.children[obj.optionHoveredIndex];
                let value = option && option.getAttribute("data-value");

                if (value) {
                    obj.nativeSelectElem.value = value;
                    obj.updateCustomSelectChecked(value);
                }
                obj.closeSelectCustom();
            }

            if (event.keyCode === 27) {
                obj.closeSelectCustom();
            }
        };

        this.init();

    };

    CustomSelect.select.prototype = {

        init: function () {
            let obj = this;
            this.customSelectTriggerElem.addEventListener("click", function (e) {
                let isClosed = !obj.customSelectElem.classList.contains("is-active");
                if (isClosed) {
                    obj.openSelectCustom();
                } else {
                    obj.closeSelectCustom();
                }
            });

            this.nativeSelectElem.addEventListener("change", function (e) {
                let value = e.target.value;
                let elRespectiveCustomOption = obj.customSelectOptionsWrapElem.querySelectorAll('[data-value="${value}"]')[0];
                obj.updateCustomSelectChecked(value, elRespectiveCustomOption.textContent);
            });

            this.customOptionsList.forEach(function (optElem, index) {
                optElem.addEventListener("click", function (e) {
                    let value = e.target.dataset.value;
                    obj.nativeSelectElem.value = value;
                    obj.updateCustomSelectChecked(value);
                    obj.closeSelectCustom();
                });

                optElem.addEventListener("mouseenter", function (e) {
                    obj.updateCustomSelectHovered(index);
                });

            });
        },

        openSelectCustom: function () {
            let obj = this;
            this.customSelectElem.classList.add("is-active");

            if (this.optionChecked) {
                let optionCheckedIndex = obj.customOptionsList.findIndex(function (el) {
                    return (el.getAttribute("data-value") === obj.optionChecked)
                });
                this.updateCustomSelectHovered(optionCheckedIndex);
            }

            document.addEventListener("click", obj.watchClickOutside);
            document.addEventListener("keydown", obj.supportKeyboardNavigation);
        },

        closeSelectCustom: function () {
            this.customSelectElem.classList.remove("is-active");

            this.updateCustomSelectHovered(-1);

            document.removeEventListener("click", this.watchClickOutside);
            document.removeEventListener("keydown", this.supportKeyboardNavigation);
        },

        updateCustomSelectHovered: function (newIndex) {
            let prevOptElem = this.customSelectOptionsWrapElem.children[this.optionHoveredIndex];
            let optElem = this.customSelectOptionsWrapElem.children[newIndex];

            if (prevOptElem) {
                prevOptElem.classList.remove("is-hover");
            }
            if (optElem) {
                optElem.classList.add("is-hover");
            }

            this.optionHoveredIndex = newIndex;
        },

        updateCustomSelectChecked: function (value) {
            let prevValue = this.optionChecked;

            let prevOptElem = this.customSelectOptionsWrapElem.querySelector('[data-value="${prevValue}"');
            let optElem = this.customSelectOptionsWrapElem.querySelector('[data-value="${value}"');

            if (prevOptElem) {
                prevOptElem.classList.remove("is-active");
            }

            if (optElem) {
                optElem.classList.add("is-active");
            }

            this.optionChecked = value;
        }

    };

    return CustomSelect;

})));