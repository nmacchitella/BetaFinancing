var tracking = {}

tracking['scenarios'] = {}
tracking['scenarios'][0] = {}
tracking['scenarios'][0]['intervals'] = {}

tracking['scenarios'][0]['intervals'][0] = {
    'start': 0,
    'end': 0, 
    'commission': 0, 
}

let range = function(start, stop, step){
    step = step || 1;
    var arr = [];
    for (var i=start;i<stop;i+=step){
    arr.push(i);
    }
    return arr;
};


function generate_sales_index(){
    let max = 100
    Object.keys(tracking['scenarios']).forEach(key => {
      Object.keys(tracking['scenarios'][key]['intervals']).forEach(key2 => {
        if(tracking['scenarios'][key]['intervals'][key2]['end']>max){
          max = tracking['scenarios'][key]['intervals'][key2]['end']
        }
      })
    })
    return max
  }

tracking['sales'] = range(0,generate_sales_index(),1)


function add_interval(event){

    let scenario = $(event.target.parentElement.parentElement).data('scenario-cnt')
    let interval_index = Object.keys( tracking['scenarios'][scenario]['intervals']).length
   

    let start = parseInt(tracking['scenarios'][scenario]['intervals'][interval_index -1]['end']) + 1
    let end = parseInt(tracking['scenarios'][scenario]['intervals'][interval_index - 1]['end']) + 501

    tracking['scenarios'][scenario]['intervals'][interval_index] = {
        'start': start,
        'end': end, 
        'commission': 0.1, 
    }

    let to_be_appended = `
            <div class="interval" data-interval-cnt="${interval_index}">
                <div class="interval-header">
                    <p style="padding: 0; margin:0">Post-MG:Interval-${interval_index}</p>
                    <button class="interval-delete-btn">delete</button>
                </div>

                <div class="inputs">
                    <label>Start:
                        <input class='input start' type="number" value="${start}">
                    </label>
                    <label>End:
                        <input class='input end' type="number" value="${end}">
                    </label>
                </div>
                <label>Commission
                    <select class='commission' style="margin-left: 5px;">
                        <option value="0.1">10%</option>
                        <option value="0.2">20%</option>
                        <option value="0.3">30%</option>
                        <option value="0.4">40%</option>
                        <option value="0.5">50%</option>
                    </select>
                </label>
            </div>
    `

    $(event.target).siblings('.scenario-intervals').append(to_be_appended)


}

function add_scenario(event){

    let scenario_index = Object.keys( tracking['scenarios']).length
    
    let to_be_appended = `
            <div data-scenario-cnt="${scenario_index}" class="scenario">
                <div class="scenario-header">
                    <button class="scenario-collapsible-btn">Scenario-${scenario_index}</button> 
                    <button class="scenario-delete-btn">delete</button>
                </div>   
                <div class="scenario-body">                    
                    
                    <div class="inputs">
                        <label>MG:<input class="input" type="number"></label>
                        <label>Comm: 
                            <select>
                                <option value="0.1">10%</option>
                                <option value="0.2">20%</option>
                                <option value="0.3">30%</option>
                                <option value="0.4">40%</option>
                                <option value="0.5">50%</option>
                            </select>
                        </label>
                    </div>

                    <hr>
                    <label for="MG-Recup">MG-BH: <input class="input mg-bh" disabled type="number"></label>
                
                    
                    <div class="scenario-intervals">
                        <div class="interval" data-interval-cnt="0">
                            <div class="interval-header">
                                <p style="padding: 0; margin:0">Post-MG:Interval-0</p>
                                <button class="interval-delete-btn">delete</button>
                            </div>

                            <div class="inputs">
                                <label>Start:
                                    <input class='input start' type="number" value="0">
                                </label>
                                <label>End:
                                    <input class='input end' type="number" value="1000">
                                </label>
                            </div>
                            <label>Commission
                                <select class='commission' style="margin-left: 5px;">
                                    <option value="0.1">10%</option>
                                    <option value="0.2">20%</option>
                                    <option value="0.3">30%</option>
                                    <option value="0.4">40%</option>
                                    <option value="0.5">50%</option>
                                </select>
                            </label>
                        </div>
                    </div>
                    
                    <button class="add-interval-btn">Add Interval</button>
                </div>
            </div>
    `
    $('.scenarios').append(to_be_appended)

    scenarios_cnt = Object.keys( tracking['scenarios']).length
    tracking['scenarios'][ scenarios_cnt] = {}
    tracking['scenarios'][scenarios_cnt]['intervals'] = {}
    tracking['scenarios'][scenarios_cnt]['intervals'][0] = {
        'start': 0,
        'end': 0, 
        'commission': 0, 
    }
  

}

function update_scenario_intervals_dic(scenario_index){


    let scenario = $(`.scenario[data-scenario-cnt="${scenario_index}"]`)
    let intervals = $(scenario).find('.interval')

    tracking['scenarios'][scenario_index]['intervals'] = {}

    intervals.each(function(index, element){
        tracking['scenarios'][scenario_index]['intervals'][$(element).data('interval-cnt')] = {
            'start': $(element).find('input.start:first').val(),
            'end': $(element).find('input.end:first').val(), 
            'commission': $(element).find('select.commission:first').val(),  
        }

    })
    tracking['sales'] = range(0,generate_sales_index(),1)


}

function delete_interval(event){
  
    let delete_interval = $(event.target.parentElement.parentElement)
    let delete_interval_index = delete_interval.data('interval-cnt')

    let scenario = delete_interval.closest('.scenario');
    let scenario_index = $(scenario).data('scenario-cnt')

    delete_interval.remove()

    let intervals = $(scenario).find('.interval')

    intervals.each(function(index, element){
        
        if($(element).data('interval-cnt')>delete_interval_index){
            let old_index =  $(element).data('interval-cnt')
            let new_index = old_index-1
            $(element).data('interval-cnt', new_index)
            $(element).find('.interval-header>p').text(`Post-MG:Interval-${new_index}`)
        }
    })
    
    update_scenario_intervals_dic(scenario_index)

}

function update_scenarios_dic(){


    let scenarios = $('.scenario')

    tracking['scenarios'] = {}

    scenarios.each(function(index, element){

        tracking['scenarios'][$(element).data('scenario-cnt')] = {}

        //mg
        let mg = $(element).find('.scenario-body>.inputs label input').val()
        let mg_commission = $(element).find('.scenario-body>.inputs label select').val()
        let mg_bh = mg/(1-mg_commission)
        tracking['scenarios'][$(element).data('scenario-cnt')]['mg'] = mg
        tracking['scenarios'][$(element).data('scenario-cnt')]['mg_commission'] = mg_commission
        tracking['scenarios'][$(element).data('scenario-cnt')]['mg_bh'] = mg_bh

        //intervals
        tracking['scenarios'][$(element).data('scenario-cnt')]['intervals'] = {}
        update_scenario_intervals_dic($(element).data('scenario-cnt'))

    })

    tracking['sales'] = range(0,generate_sales_index(),1)
    

}

function delete_scenario(event){

    // to be done
  
    let delete_scenario = $(event.target.parentElement.parentElement)
    let delete_scenario_index = $(delete_scenario).data('scenario-cnt')

    delete_scenario.remove()

    let scenarios = $('.scenario')

    scenarios.each(function(index, element){
               
        if($(element).data('scenario-cnt')>delete_scenario_index){
            let old_index =  $(element).data('scenario-cnt')
            let new_index = old_index-1
            $(element).data('scenario-cnt', new_index)
            $(element).find('.scenario-header>button:first').text(`Scenario-${new_index}`)
        }
    })

    update_scenarios_dic()
   

}


$( document ).ready(function() {
    $('.add-scenario-btn').click({param1: 0, param2: 0}, add_scenario)
    
    $('.scenarios').on('click',".interval-delete-btn",delete_interval)
    $('.scenarios').on('click',".add-interval-btn",add_interval)
    $('.scenarios').on('click',".scenario-delete-btn",delete_scenario)

    $('.scenarios').on('click',".scenario-collapsible-btn",function(event){
        $(event.target.parentElement).siblings('.scenario-body').toggleClass("d-none");
    })

    //update MG break-even point
    $('.scenarios').on('change', '.scenario-body>.inputs label input, .scenario-body>.inputs label select',function(event){        
       
        let scenario = $(event.target).closest('.scenario').data('scenario-cnt');
        let mg = $(event.target).closest('.scenario').find('.scenario-body>.inputs label input').val()
        let mg_commission = $(event.target).closest('.scenario').find('.scenario-body>.inputs label select').val()
        let mg_bh = mg/(1-mg_commission)

        $(event.target).closest('.scenario').find(".mg-bh").val(mg_bh.toFixed(2))
        $(event.target).closest('.scenario').find(".interval[data-interval-cnt='0'] .inputs .input.start").val(Math.floor(mg_bh)+1)
        $(event.target).closest('.scenario').find(".interval[data-interval-cnt='0'] .inputs .input.end").val(Math.floor(mg_bh)+501)

        tracking['scenarios'][scenario]['mg'] = mg
        tracking['scenarios'][scenario]['mg_commission'] = mg_commission
        tracking['scenarios'][scenario]['mg_bh'] = mg_bh
        tracking['sales'] = range(0,generate_sales_index(),1)
       
    })

    $('.scenarios').on('change','.scenario input, .scenario select', function(event){
        update_scenario_intervals_dic($(event.target).closest('.scenario').data('scenario-cnt'))
    })

    $('.scenarios').on('change','.scenario input.start', function(event){
        let IntervalIndex = $(event.target).closest('.interval').data('interval-cnt')
        if(IntervalIndex>0){
            let IntervalIndexUpdating = IntervalIndex - 1
            $(event.target).closest('.scenario').find(`.interval[data-interval-cnt='${IntervalIndexUpdating}'] .inputs .input.end`).val(Math.floor($(event.target).val())-1) 
        }        

    $('.scenarios').on('change','.scenario input.end', function(event){
        let IntervalIndex = $(event.target).closest('.interval').data('interval-cnt')
        let ScenarioIndex = $(event.target).closest('.scenario').data('scenario-cnt');
        let NumberIntervals = Object.keys(tracking['scenarios'][ScenarioIndex]['intervals']).length
       
        if(IntervalIndex<NumberIntervals-1){
            let IntervalIndexUpdating = IntervalIndex + 1
            $(event.target).closest('.scenario').find(`.interval[data-interval-cnt='${IntervalIndexUpdating}'] .inputs .input.start`).val(Math.floor($(event.target).val())+1)
        }        
    })
   

    
});
