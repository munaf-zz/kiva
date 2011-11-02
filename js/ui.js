$(document).ready(function() {
  // Populate partner combo box with partner names.
  function makeOptions() {
    var pids = KIVA['pids'];
    var partners = KIVA['partners'];
    var options=""; 

    for (var i = 0; i < pids.length; i++) {
      options += "<option class='partner' id='" + pids[i] + "'>" + 
                 partners[i] + "</option>";
    }
    $('select').html(options);
  }

  // Apply chosen.css class
  makeOptions();
  $('.chzn-select').chosen();
});
