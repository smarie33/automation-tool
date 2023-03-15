//the time specified is for the entire hour
// <= 11 is less than or equal to 11:59
var time = new Date().getHours();
if (time <= 7) {
 $('.one').show();
} else if (time > 7 && time <= 11) {
 $('.two').show();
} else if (time > 11 && time <= 15) {
 $('.three').show();
} else if (time > 15 && time <= 19) {
 $('.four').show();
} else if (time > 19) {
 $('.five').show();
}
