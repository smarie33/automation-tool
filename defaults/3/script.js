var time = new Date().getHours();
if (time <= 7) {
 $('.three').show();
} else if (time > 7 && time <= 11) {
 $('.three').show();
} else if (time > 11 && time <= 15) {
 $('.three').show();
} else if (time > 15 && time <= 19) {
 $('.three').show();
} else if (time > 19) {
 $('.three').show();
}

let runThis = "three";

if(document.querySelector('.slide.slider.'+runThis) != null){
  var slideOnThisOne, slideOnThisTwo, slideOnThisThree, slideOnThisFour, slideOnThisFive;
  const intervals = {one:slideOnThisOne,two:slideOnThisTwo, three:slideOnThisThree, four:slideOnThisFour, five:slideOnThisFive};

  startAfterPause(runThis);
  document.querySelector('.container .slider.'+runThis).addEventListener('mouseover', function(){
    clearInterval(intervals[runThis]);
  })

  document.querySelector('.container .slider.'+runThis).addEventListener('mouseleave', function(){
    startAfterPause(runThis);
  })

  function startAfterPause(num) {
    setTimeout(num => {
      moveSlider(num);
      intervals[num] = setInterval(
        () => moveSlider(num),
        5000
      );
    },500,num)
  }

  function moveSlider(slideNUm){
    var unit = document.querySelector('.slider.'+slideNUm+' .album-container').offsetWidth;

    var elem = document.querySelector('.slider.'+slideNUm+' .content');
    var left = '-170px' //getPropertyVal(elem,'left');
    var width = getPropertyVal(elem,'width');
    var newLeft = -360; //(parseInt(left) - unit) - 10;
    var newWidth = (parseInt(width) - unit) - 10;
    elem.style.left = newLeft+'.px';
    elem.style.transitionDuration = '';
    setTimeout(() => {
      elem.style.transitionDuration = '0s';
      var moveLast = document.querySelector('.slider.'+slideNUm+' .album-container:first-of-type').innerHTML;
      document.querySelector('.slider.'+slideNUm+' .album-container:first-of-type').remove();
      document.querySelector('.slider.'+slideNUm+' .album-set').insertAdjacentHTML('beforeend', '<div class="album-container">'+moveLast+'</div>');
      elem.style.left = left;
    },800);
  }

  function getPropertyVal(elem,property){
    return window.getComputedStyle(elem,null).getPropertyValue(property);
  }

} //does not equal null
