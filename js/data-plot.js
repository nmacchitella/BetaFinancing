  const colors = ['blue', 'red', 'green', 'yellow', 'black', ]
 
  function FormatValue(value){
    if(parseFloat(Math.abs(value))>999){
      let val = Math.round(parseFloat(value)/1000 *100)/100
      return val.toString() + 'M'
    }
    else{
      let val = Math.round(parseFloat(value) *100)/100
      return val.toString() + 'K'
    }
  }


  function compute_sale_rev(sale, scenario) {

      let revenue = 0
      let beta_rev =  - scenario['mg']
      let producer_rev = 0
  
      if(sale <= scenario['mg_bh']){
          return {'revenue': sale,'beta_rev': beta_rev + sale*(1-scenario['mg_commission']),'producer_rev': 0}
        } else {
          revenue = scenario['mg_bh']
          beta_rev = 0
          producer_rev = 0
        }
      
      Object.keys(scenario['intervals']).forEach(key => {

          let element =  scenario['intervals'][key]

          if(element['start']>sale){
            return {'rev': 0,'beta_rev': 0,'producer_rev': 0}
          }
  
          if(element['start'] < sale && sale <= element['end']){
            revenue = sale 
            beta_rev = beta_rev + (sale - element['start'])*element['commission']
            producer_rev = producer_rev + (sale - element['start'])*(1-element['commission'])
          }
  
          if (sale>element['end']) {
            revenue = sale
            beta_rev = beta_rev + (element['end'] - element['start'])*element['commission']
            producer_rev = producer_rev + (element['end'] - element['start'])*(1-element['commission'])

          }

      })


    return {'revenue': revenue,'beta_rev': beta_rev,'producer_rev': producer_rev}

  }

  function create_data(scenario, index){

    scenario['revenue'] = {}

    scenario['revenue']['revenue'] = tracking['sales'].map(element => Math.round(compute_sale_rev(element, scenario)['revenue']* 100)/100) 
    scenario['revenue']['beta_rev'] = tracking['sales'].map(element => Math.round(compute_sale_rev(element, scenario)['beta_rev']* 100)/100)
    scenario['revenue']['producer_rev'] = tracking['sales'].map(element => Math.round(compute_sale_rev(element, scenario)['producer_rev']* 100)/100) 


    return {
              label: `Scenario - ${index}`,
              data: tracking['sales'].map(element => Math.round(compute_sale_rev(element, scenario)['beta_rev'])) ,
              borderColor: colors[index] ,
              //backgroundColor: colors[index],
              fill: false,
              tension: 0.1,
              pointRadius: 0,
          }
  }

  function get_index_closest(val,array){

    return $(array).index(array.reduce(function(prev, curr) {
      return (Math.abs(curr - val) < Math.abs(prev - val) ? curr : prev);
    }))

  }

  function update_chart(chart){
    
    let new_data = []

    Object.keys(tracking['scenarios']).forEach(key => {
      new_data.push(create_data(tracking['scenarios'][key],key))
      //annotations.push(create_annotation(tracking['scenarios'][key],key))
    })
    chart.data.datasets=new_data
   
    chart.options.plugins.annotation.annotations['mg-recup'] = {  type: 'line',
                                                                  yMin: 0,
                                                                  yMax: 0,
                                                                  borderColor: 'rgb(255, 99, 132)',
                                                                  borderWidth: 1,
                                                                }
    chart.data.labels = tracking['sales']
    
    chart.update()
  }

  function created_datatable(){

    if ( $.fn.DataTable.isDataTable( '#DataTable-Margins' ) ) {
      $('#DataTable-Margins').DataTable().destroy()
      $('#DataTable-Margins').empty()
    }

    let dataSet = []
    let columns = [{ title : `Sales`}]

    Object.keys(tracking['scenarios']).forEach(key => {
      columns.push({ title : `Scenario - ${key}`})
    })


    $(tracking['sales']).each(function(index, value) {

      if(index % 10 == 0){
        let tmp = [ FormatValue(tracking['sales'][index]) ]
        Object.keys(tracking['scenarios']).forEach(key => {
          tmp.push(FormatValue(tracking['scenarios'][key]['revenue']['beta_rev'][index]))
        })
        dataSet.push(tmp)
       }      
    })
    
   

    $('#DataTable-Margins').DataTable({
      data: dataSet,
      columns: columns,
      dom: 'frtip<"bottom-wrapper"B>',
      buttons: [
           'excel', 'pdf', //'print', 'csv', 'copy',
      ],
      scrollY: '200px',
      scrollCollapse: true,
      paging: false,
      scrollX: true,
      searching: false,
      ordering: false
      

      });
  
  }




  //config
  const config = {
                    type: 'line',
                    data: {
                            labels: range(0,2000,1),
                            datasets: []
                          },
                    options: {
                      scales: {
                          y: {
                              title:{
                                display: true,
                                text: 'Profit'
                              },
                              ticks: {
                                  // Include a dollar sign in the ticks
                                  callback: function(value, index, ticks) {
                                      return '$' + value + 'K';
                                  }
                              }
                          },
                          x: {
                              title:{
                                display: true,
                                text: 'Sales'
                              },
                              ticks: {
                                // Include a dollar sign in the ticks
                                callback: function(value, index, ticks) {
                                    return '$' + FormatValue(value);
                                }
                              }
                          }
                      },
                      responsive: true,
                      plugins: {
                        autocolors: false,
                        legend: {
                          position: 'top',
                        },
                        annotation: {
                          annotations: { }
                        },
                        title: {
                          display: true,
                          text: 'Financing Scenarios'
                        },
                        subtitle: {
                          display: true,
                          text: 'Compare profits for different financing structures and sales levels.'
                        },
                        zoom: {
                          zoom: {
                            wheel: {
                              enabled: true,
                              speed: 0.0005
                            },
                            pinch: {
                              enabled: true
                            },
                            drag: {
                              enabled: true
                            },
                            pan: {
                              enabled: true
                            },
                            mode: 'xy',
                          }
                        }
                      }
                    },
                  };

  $( document ).ready(function() {
      const myChart = new Chart( document.getElementById('myChart'),config);
      var chart = Chart.getChart("myChart");
      $('.refresh').click(function(){
        update_chart(chart)
        created_datatable()
        chart.resetZoom()
      })


  });



  $( document ).ready(function() {

    
   
  })

  



