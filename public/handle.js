/*
$("button").click(function(){
	$.get('/map', function (data) {
		$('#title').html(data.title);
		$('#address').html(data.address);
	})
});
*/

$("button").click(function(){
	$.post( "/map", JSON.stringify({ name: "Dom"}), function( data ) {
	  console.log(data.data)
	});
});