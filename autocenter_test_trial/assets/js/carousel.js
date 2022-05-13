(function (global, factory) {
    global.Carousel = factory();
}(this, (function () {

    let Carousel = {};
    Carousel.configParam = function(key, config, default_value){
        if (typeof config !== 'object') return default_value;
        return (config[key] !== undefined) ? config[key] : default_value;
    };
    let itemClassName = "carousel-item";

    Carousel.carousel = function (object, config) {
        this.object = object;
        this.config = config;

        this.items = object.children;

        this.totalItems = this.items.length;
        this.slide = 0;
        this.moving = true;

        this.prevBtn = Carousel.configParam('prevBtn', config, false);
        this.nextBtn = Carousel.configParam('nextBtn', config, false);
        this.counter = Carousel.configParam('counter', config, false);

        this.init();
    };

    Carousel.carousel.prototype = {

        setInitialClasses: function () {
            this.items[this.totalItems - 1].classList.add("prev");
            this.items[0].classList.add("active");
            this.items[1].classList.add("next");
        },

        update: function(){

            this.disableInteraction();

            let activeSlide = this.activeSlide();
            let prevSlide = this.prevSlide();
            let nextSlide = this.nextSlide();


            let newActiveSlide = this.items[this.activeIndex()];
            let newPrevSlide = this.items[this.prevIndex()];
            let newNextSlide = this.items[this.nextIndex()];

            activeSlide.classList.remove("active");
            prevSlide.classList.remove("prev");
            nextSlide.classList.remove("next");

            newActiveSlide.classList.add("active");
            newPrevSlide.classList.add("prev");
            newNextSlide.classList.add("next");
            if (this.counter) {
                this.counter.innerHTML = this.slide + 1;
            }
        },

        activeIndex: function(){
            return this.slide;
        },

        prevIndex: function(){
            let index = this.slide;
            index--;
            if (index<0) index = this.totalItems + index;
            return index;
        },

        nextIndex: function(){
            let index = this.slide;
            index++;
            if (index>=this.totalItems) index = index - this.totalItems;
            return index;
        },

        setEventListeners: function() {
            let obj = this;
            let btn;
            if (this.prevBtn){
                btn = $(this.prevBtn);
                btn.on('click', function(){obj.movePrev();});
            }
            if (this.nextBtn){
                btn = $(this.nextBtn);
                btn.on('click', function(){obj.moveNext();});
            }
        },

        disableInteraction: function() {
            let obj = this;
            this.moving = true;
            setTimeout(function(){
                obj.moving = false
            }, 300);
        },

        prevSlide: function(){
            return this.object.querySelector('.prev');
        },
        nextSlide: function(){
            return this.object.querySelector('.next');
        },
        activeSlide: function(){
            return this.object.querySelector('.active');
        },

        moveNext: function () {
            if (!this.moving) {
                this.slide = this.nextIndex();
                this.update();
            }
        },

        movePrev: function () {
            if (!this.moving) {
                this.slide = this.prevIndex();
                this.update();
            }
        },

        init: function () {
            Array.from(this.items).forEach(function (item) {
                item.classList.add(itemClassName);
            });
            this.setInitialClasses();
            this.setEventListeners();
            this.moving = false;
        }

    };

    return Carousel;

})));