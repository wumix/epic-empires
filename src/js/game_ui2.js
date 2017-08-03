function InitialUIHandler(){
    setMapSquareLocation(userCities[currentCity].loc_x, userCities[currentCity].loc_y);
    uiUpdate();
    uiBuildingsUpdate();
}
function recursiveUiUpdate(cb){
    getUserInfo(function(){
        uiUpdate();
        uiBuildingsUpdate();

        updateTaskList(function(){
            uiUpdateTaskList();
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

    $("#building-barracks").find('.level').html(cd.b_barracks);
    $("#building-barracks").find('.level2').html(parseInt(cd.b_barracks)+1);
    if(cd.b_barracks2.time != -1){
        $("#building-barracks").find('.time').html(cd.b_barracks2.time.toString()+' s');
        $("#building-barracks .upgrade").removeClass('disabled');
    }
    var html = '';
    for(var i in cd.b_barracks2.costs){
        var k = cd.b_barracks2.costs[i]; //each resource
        html += '<img src="/assets/img/items/res_'+i+'.png"> '+k+' &nbsp;'
    }
    $("#building-barracks").find('.res').html(html);

    $("#building-academy").find('.level').html(cd.b_academy);
    $("#building-academy").find('.level2').html(parseInt(cd.b_academy)+1);
    if(cd.b_academy2.time != -1){
        $("#building-academy").find('.time').html(cd.b_academy2.time.toString()+' s');
        $("#building-academy .upgrade").removeClass('disabled');
    }
    var html = '';
    for(var i in cd.b_academy2.costs){
        var k = cd.b_academy2.costs[i]; //each resource
        html += '<img src="/assets/img/items/res_'+i+'.png"> '+k+' &nbsp;'
    }
    $("#building-academy").find('.res').html(html);

    for(var i in cd.resdata){
        var v = cd.resdata[i];
        $("#get-"+i).find('.res').html(v.workers);
        $("#get-"+i).find('.time').html(v.time.toString()+' s');
        var html = '';
        for(j in v.result){
            var v2 = v.result[j];
            html += '<img src="/assets/img/items/res_'+j+'.png"> '+k+' &nbsp;'
        }
        $("#get-"+i).find('.result').html(html);
    }
}
function uiUpdateTaskList(cb){
    for(var task in currentTasks){
        console.log(task);
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

function showTaskList(){
    recursiveUiUpdate(function(){
        $(".accordion-data").slideUp();
    })
}
