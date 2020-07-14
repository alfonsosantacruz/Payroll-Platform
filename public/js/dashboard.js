$('.form-group').on('input', '.mr-sm-1', function(){
	var totalSum = 0;
	$(".form-group .mr-sm-1").each(function(){
		var inputVal = $(this).val();
		if($.isNumeric(inputVal)){
			totalSum += parseFloat(inputVal);
		}
	});
	$('#total').html(totalSum);
});

$('td').on('input', '.mr-sm-1', function(){
	var totalSum = 0;
	$("td .mr-sm-1").each(function(){
		var inputVal = $(this).val();
		if($.isNumeric(inputVal)){
			totalSum += parseFloat(inputVal);
		}
	});
	$('#total').html(totalSum);
});
