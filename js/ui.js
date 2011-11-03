$(document).ready(function() {
  // Populate partner combo box with partner names.
  function makeOptions() {
    var options="<option id='0' class='partner'>All</option>"; 

    for (var i = 0; i < PIDS.length; i++) {
      options += "<option class='partner' id='" + PIDS[i] + "'>" + 
                 PARTNERS[i] + "</option>";
    }
    $('#partner').html(options);
    $('#partner').change(function() {
      filterByPartner(parseInt($('#partner option:selected').attr('id')));
    });
  }

  // Apply chosen.css class
  makeOptions();
  //$('.chzn-select').chosen();
});
