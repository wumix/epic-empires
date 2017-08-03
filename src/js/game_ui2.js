function InitialUIHandler(){
    setMapSquareLocation(userCities[currentCity].loc_x, userCities[currentCity].loc_y);
    uiUpdate();
    uiBuildingsUpdate();
    updateTaskList(function(){
        uiUpdateTaskList();
        $(".tasklist .accordion-data").slideDown();
    });
}
function recursiveUiUpdate(cb){
    getUserInfo(function(){
        uiUpdate();
        drawMyCities();
        uiBuildingsUpdate();

        updateTaskList(function(){
            uiUpdateTaskList();
            if(typeof cb == 'function')
                cb();
        });
    });
}
function uiUpdate(){
    var cd = userCities[currentCity];
    $('.cityimage').attr('src', '/assets/img/items/city'+cd.level+'.png');
    $("#city-name").html('City 1 ('+cd.points+' p)');
    $("#res-food").html(cd.r_food);
    $("#res-food").prev().attr('title', 'Food | Max: '+cd.r_max);
    $("#res-gold").html(cd.r_gold);
    $("#res-gold").prev().attr('title', 'Gold | Max: '+cd.r_max);
    $("#res-wood").html(cd.r_wood);
    $("#res-wood").prev().attr('title', 'Wood | Max: '+cd.r_max);
    $("#res-workers").html(cd.r_workers);
    $("#res-workers").prev().attr('title', 'Free Workers');
}
function uiBuildingsUpdate(){
    var cd = userCities[currentCity];
    $(".buildings .upgrade").addClass('disabled');
    for(var i in cd.builddata){
        var dt = cd.builddata[i];
        var lvl = parseInt(cd['b_'+i]);
        $("#building-"+i).find('.level').html(lvl);
        $("#building-"+i).find('.level2').html(lvl+1);
        if(typeof dt.workers == 'undefined')
            dt.workers = 0;
        $("#building-"+i).find('.wrk').html(dt.workers);
        if(dt.time != -1){
            $("#building-"+i).find('.time').html(dt.time.toString()+' s');
            $("#building-barracks .upgrade").removeClass('disabled');
        }
        var html = '';
        for(var j in dt.costs){
            var k = dt.costs[j]; //each resource
            html += '<img src="/assets/img/items/res_'+j+'.png"> '+k+' &nbsp;'
        }

        $("#building-"+i).find('.res').html(html);
    }
    // $("#building-barracks").find('.level').html(cd.b_barracks);
    // $("#building-barracks").find('.level2').html(parseInt(cd.b_barracks)+1);
    // if(cd.b_barracks2.time != -1){
    //     $("#building-barracks").find('.time').html(cd.b_barracks2.time.toString()+' s');
    //     $("#building-barracks .upgrade").removeClass('disabled');
    // }
    // var html = '';
    // for(var i in cd.b_barracks2.costs){
    //     var k = cd.b_barracks2.costs[i]; //each resource
    //     html += '<img src="/assets/img/items/res_'+i+'.png"> '+k+' &nbsp;'
    // }
    // $("#building-barracks").find('.res').html(html);
    //
    // $("#building-academy").find('.level').html(cd.b_academy);
    // $("#building-academy").find('.level2').html(parseInt(cd.b_academy)+1);
    // if(cd.b_academy2.time != -1){
    //     $("#building-academy").find('.time').html(cd.b_academy2.time.toString()+' s');
    //     $("#building-academy .upgrade").removeClass('disabled');
    // }
    // var html = '';
    // for(var i in cd.b_academy2.costs){
    //     var k = cd.b_academy2.costs[i]; //each resource
    //     html += '<img src="/assets/img/items/res_'+i+'.png"> '+k+' &nbsp;'
    // }
    // $("#building-academy").find('.res').html(html);

    for(var i in cd.resdata){
        var v = cd.resdata[i];
        $("#get-"+i).find('.res').html(v.workers);
        $("#get-"+i).find('.time').html(v.time.toString()+' s');
        var html = '';
        for(j in v.result){
            var v2 = v.result[j];
            html += '<img src="/assets/img/items/res_'+j+'.png"> '+v2+' &nbsp;'
        }
        $("#get-"+i).find('.result').html(html);
    }
}
function uiUpdateTaskList(cb){
    var ct = Math.floor(Date.now() / 1000);
    $(".tasklist .accordion-data").html('');
    for(var i in currentTasks){
        var v = currentTasks[i];
        var html = '';
        html += '<div class="task">';
        html += '<h4>'+v.taskname+'</h4>';
        if(v.workers > 0)
            html += '<p>Workers: <img src="/assets/img/items/res_workers.png" class="wrkic"> <span class="res">'+v.workers+'</span></p>';
        html += '<p>Time Left: <span class="tleft" data-timee="'+v.time_e+'">'+(v.time_e - ct)+' s</span></p>';
        if(v.result){
            html += '<p>Result: ';
            for(j in v.result){
                var v2 = v.result[j];
                html += '<span class="result"><img src="/assets/img/items/res_'+j+'.png"> '+v2+' &nbsp;</span>'
            }
            html += '</p>';
        }
        html += '<button class="upgrade btn1" data-id="canceltask-'+v.id+'">Cancel</button>';
        html += '</div>';
        $(".tasklist .accordion-data").append(html);
    }
    if(currentTasks.length == 0){
        $(".tasklist .accordion-data").html('<p>No runnig task...</p>');
    }
}
function updateTaskList(cb){
    ajaxPost('/ajax/game/get_tasks', {
        city_id: currentCityId
    }, function(data){
        currentTasks = data;
        if(typeof cb == 'function')
            cb();
    })
}



$(document).on('click', '.upgrade', function(e){
    e.preventDefault();
    var dt = $(this).data('id');
    var dt2 = dt.split('-');
    if(dt2[0] == 'get'){
        startTask('get', dt2[1]);
    }else if(dt2[0] == 'build'){
        startTask('build', dt2[1]);
    }else if(dt2[0] == 'attack'){
        startTask('attack', dt2[1]);
    }else if(dt2[0] == 'canceltask'){
        stopTask(dt2[1]);
    }
});

function startTask(task, param1){
    ajaxPost('/ajax/game/add_task', {
        city_id: currentCityId,
        task: task,
        param: param1
    }, function(data){
        res = parseAjaxData(data);
        if(res.type == 'error'){
            error_txt(res.text, res.title);
        }else{
            showTaskList();
        }
    })
}
function stopTask(task_id){
    ajaxPost('/ajax/game/del_task', {
        city_id: currentCityId,
        task_id: task_id
    }, function(data){
        res = parseAjaxData(data);
        if(res.type == 'error'){
            error_txt(res.text, res.title);
        }else{
            showTaskList();
        }
    })
}

function showTaskList(){
    recursiveUiUpdate(function(){
        $(".tasklist .accordion-data").slideDown();
        $('.menuh:first-child').animate({scrollTop: 0}, 100);
    })
}
