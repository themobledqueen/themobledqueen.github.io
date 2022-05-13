
let offcanvas_pending = false;

function toggle_offcanvas(toggle_btn, offcanvas_elem, on_start, on_finish){
    if (offcanvas_pending) return false;
    let offcanvas_state = offcanvas_elem.data('state');
    if (!offcanvas_state) offcanvas_state = 0;
    let next_state = 1 - offcanvas_state;
    let body = $('body');
    let time = 300;
    offcanvas_pending = true;
    if (typeof on_start === 'function') on_start(toggle_btn, offcanvas_elem, next_state);

    let update_state = function(){
        offcanvas_state = next_state;
        offcanvas_pending = false;
        offcanvas_elem.data('state', offcanvas_state);
    };
    if (next_state){
        body.css('overflow', 'hidden');
        offcanvas_elem.slideDown(time, function(){
            if (typeof on_finish === 'function') on_finish(toggle_btn, offcanvas_elem, next_state);
            update_state();
        });
    } else {
        body.css('overflow', '');
        offcanvas_elem.slideUp(time, function(){
            if (typeof on_finish === 'function') on_finish(toggle_btn, offcanvas_elem, next_state);
            update_state();
        });
    }
}

function init_offcanvas(toggle_btn_sel, offcanvas_sel, on_start, on_finish){
    $(document).on('click', toggle_btn_sel, function(){
        let btn = $(this);
        let offcanvas = $(offcanvas_sel);
        let offcanvas_inner = offcanvas.find('.offcanvas-inner');
        let offcanvas_close_btn = offcanvas.find('.offcanvas-close-btn');
        toggle_offcanvas(btn, offcanvas, on_start, on_finish);

        let close_offcanvas_fn = function(){
            const click_on_inner = offcanvas_inner[0].contains(event.target);
            if (!click_on_inner) {
                toggle_offcanvas(btn, offcanvas, on_start, on_finish);
            }
        };

        offcanvas.on('click', function(e){
            close_offcanvas_fn();
        });

        offcanvas_close_btn.on('click', function(e){
            close_offcanvas_fn();
        });

    });
}

init_offcanvas(
    '.navbar-offcanvas-toggle-btn',
    '.main-offcanvas',
    function(btn, offcanvas, state){
        let navbar = $('.navbar');
        if (state){
            btn.addClass('active');
            navbar.addClass('main-offcanvas-active');
        } else {
            btn.removeClass('active');
            navbar.removeClass('main-offcanvas-active');
        }
    }
);


init_offcanvas(
    '.apply-for-service-btn, .consult-apply-btn',
    '.application-offcanvas',
    function(btn, offcanvas, state){
        if (state){
            btn.addClass('active');
        } else {
            btn.removeClass('active');
        }
    }
);

init_offcanvas(
    '.feedback-btn',
    '.feedback-offcanvas',
    function(btn, offcanvas, state){
        if (state){
            btn.addClass('active');
        } else {
            btn.removeClass('active');
        }
    }
);
