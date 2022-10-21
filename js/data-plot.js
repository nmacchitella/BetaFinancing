  const colors = ['blue', 'red', 'yellow', 'green']
 



  function compute_sale_rev(sale, scenario) {

      let revenue = 0
      let beta_rev =  - scenario['mg_bh']
      let producer_rev = 0
  
      if(sale <= scenario['mg_bh']){
          return {'revenue': sale,'beta_rev': beta_rev + sale,'producer_rev': 0}
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

    if ( $.fn.DataTable.isDataTable( '#example' ) ) {
      $('#example').DataTable().destroy()
      $('#example').empty()
    }

    let dataSet = []
    let columns = []

    columns.push({ title : "Sales"})
    Object.keys(tracking['scenarios']).forEach(key => {
      columns.push({ title : `Scenario - ${key}`})
    })


    $(tracking['sales']).each(function(index, value) {

      if(index % 10 == 0){
        let tmp = [ tracking['sales'][index] ]
        Object.keys(tracking['scenarios']).forEach(key => {
          tmp.push(tracking['scenarios'][key]['revenue']['beta_rev'][index])
        })
        dataSet.push(tmp)
       }      
    })
    
   

    $('#example').DataTable({
      data: dataSet,
      columns: columns,
      dom: 'frtipB',
      buttons: [
           'excel', 'pdf', //'print', 'csv', 'copy',
      ],
      scrollY: '200px',
      scrollCollapse: true,
      paging: false,
      scrollX: true,
      searching: false

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
                          text: 'Beta Revenue'
                        },
                      }
                    },
                  };

  $( document ).ready(function() {
      const myChart = new Chart( document.getElementById('myChart'),config);
      var chart = Chart.getChart("myChart");
      $('.refresh').click(function(){
        update_chart(chart)
        created_datatable()
      })


  });



  $( document ).ready(function() {

    
   
  })

  



