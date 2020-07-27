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


$(window).scroll(function() {
  sessionStorage.scrollTop = $(this).scrollTop();
});

$(document).ready(function() {
  if (sessionStorage.scrollTop != "undefined") {
    $(window).scrollTop(sessionStorage.scrollTop);
  }
});

$(function () {
  $('[data-toggle="popover"]').popover()
})

// $(document).ready(function(){
//   $("body").scroll(function(){
//   	var scrollVal = document.getElementsByTagName("body")[0].scrollTop;
//     $("#sTopVal").html(scrollVal);
//   });
// });

// function refreshPage () {
//     var page_y = document.getElementsByTagName("body")[0].scrollTop;
//     window.location.href = window.location.href.split('?')[0] + '?page_y=' + page_y;
// }

// $('#submit').on('click', function() {
// 	alert('Clicked Submit Button');
//     location.reload();
//     if ( window.location.href.indexOf('page_y') != -1 ) {
//         var match = window.location.href.split('?')[1].split("&")[0].split("=");
//         document.getElementsByTagName("body")[0].scrollTop = match[1];
//     }
// });

