$('.one').show();
$('.two').show();
$('.three').show();
$('.four').show();
$('.five').show();
$('.six').show();
$('.seven').show();
$('.eight').show();
$('.nine').show();
$('.ten').show();
$('.eleven').show();
$('.twelve').show();

window.addEventListener('load', function () {
  const colorThief = new ColorThief();

  let imgs = document.querySelectorAll('.carousel img');
    // Make sure image is finished loading
  imgs.forEach(function(img) {
    //console.log(img)
    let c;
    if (img.complete) {
      c = colorThief.getColor(img);
    } else {
      img.addEventListener('load', function() {
        c = colorThief.getColor(img);
      });
    }
    //console.log(img.nextElementSibling);
    img.nextElementSibling.style.backgroundColor = 'rgb(' + c.join(',') + ')';
    //console.log(c);
  });

  var selectedIndex = 0;
  var carousel = document.querySelector('.carousel .album-set');
  var cells = carousel.querySelectorAll('.carousel .album-container');
  var cellCount = cells.length;
  var cellSize = carousel.offsetWidth + 50;
  var radius = Math.round( ( cellSize / 2) / Math.tan( Math.PI / cellCount ) );
  var theta = 360 / cellCount;
  var getTiming = document.querySelector('.slide.carousel .content .album-set');
  var deg = 0;
  //do transforms
  cells.forEach(function(cell){
    cell.style.cssText += 'transform: rotateY('+deg+'deg) translateZ('+radius+'px)';
    deg += theta;
  })

  var nthOfType = 1;
  var prev = cellCount;
  var next = nthOfType++;

  var prevprev = cellCount - 1;
  var nextnext = nthOfType + 1;

  pnext = next;
  pnth = nthOfType;
  pprev = prev;


  function rotateCarousel() {
    document.querySelector('.slide.carousel .album-container:nth-of-type('+nextnext+')').classList.remove('back');
    document.querySelector('.slide.carousel .album-container:nth-of-type('+next+')').classList.remove('back');
    document.querySelector('.slide.carousel .album-container:nth-of-type('+nthOfType+')').classList.remove('back');
    document.querySelector('.slide.carousel .album-container:nth-of-type('+prev+')').classList.remove('back');
    document.querySelector('.slide.carousel .album-container:nth-of-type('+prevprev+')').classList.remove('back');

    ppnextnext = nextnext;
    pnext = next;
    pnth = nthOfType;
    pprev = prev;
    pprevrev = prevprev;


    var angle = theta * selectedIndex * -1;
    carousel.style.transform = 'translateZ(' + -radius + 'px) ' + 'rotateY' + '(' + angle + 'deg)';
    selectedIndex++;

  if(selectedIndex > 1){
    if(nthOfType == cellCount){
      nthOfType = 1;
    }else{
      nthOfType++;
    }
    if(prev == cellCount){
      prevprev = cellCount;
      prev = 1;
    }else{
      prevprev = prev;
      prev++;
    }
    if(nextnext == cellCount){
      next++;
      nextnext = 1;
    }else if(next == cellCount){
      next = 1;
      nextnext++;
    }else{
      next++;
      nextnext++;
    }
  }

    delayNext();
  }

  if(document.querySelectorAll('.container .carousel').length > 0){
    rotateCarousel();

    var rotateOnThis = setInterval(
      () => rotateCarousel(),
      3000
    );
  }

  function delayNext(){
    setTimeout(() => {
      document.querySelector('.slide.carousel .album-container:nth-of-type('+ppnextnext+')').classList.add('back');
      document.querySelector('.slide.carousel .album-container:nth-of-type('+pnext+')').classList.add('back');
      document.querySelector('.slide.carousel .album-container:nth-of-type('+pnth+')').classList.add('back');
      document.querySelector('.slide.carousel .album-container:nth-of-type('+pprev+')').classList.add('back');
      document.querySelector('.slide.carousel .album-container:nth-of-type('+pprevrev+')').classList.add('back');

      document.querySelector('.slide.carousel .album-container:nth-of-type('+nextnext+')').classList.remove('back');
      document.querySelector('.slide.carousel .album-container:nth-of-type('+next+')').classList.remove('back');
      document.querySelector('.slide.carousel .album-container:nth-of-type('+nthOfType+')').classList.remove('back');
      document.querySelector('.slide.carousel .album-container:nth-of-type('+prev+')').classList.remove('back');
      document.querySelector('.slide.carousel .album-container:nth-of-type('+prevprev+')').classList.remove('back');
    }, 600)
       //^ this is a little less than the transition time from the css on .slide.carousel .content .album-set
  }

  document.querySelector('.container .carousel').addEventListener('mouseover', function(){
    clearInterval(rotateOnThis);
  })

  document.querySelector('.container .carousel').addEventListener('mouseleave', function(){
    setTimeout(() => {
      rotateCarousel();
      rotateOnThis = setInterval(
        () => rotateCarousel(),
        3000
      );
    },500)
  })


  var unit = document.querySelector('.slider .album-container').offsetWidth;
  var num = 1;
  if(document.querySelectorAll('.container .slider').length > 0){
    moveSlider();

    var slideOnThis = setInterval(
      () => moveSlider(),
      3000
    );
  }

  function moveSlider(){
    var elem = document.querySelector('.slider .content');
    var left = getPropertyVal(elem,'left');
    var width = getPropertyVal(elem,'width');
    var newLeft = (parseInt(left) - unit) - 10;
    var newWidth = (parseInt(width) - unit) - 10;
    elem.style.left = newLeft+'.px';
    elem.style.transitionDuration = '';
    //transition duration 0.8s set in css
    setTimeout(() => {
      elem.style.transitionDuration = '0s';
      var moveLast = document.querySelector('.slider .album-container:first-of-type').innerHTML;
      document.querySelector('.slider .album-container:first-of-type').remove();
      document.querySelector('.slider .album-set').insertAdjacentHTML('beforeend', '<div class="album-container">'+moveLast+'</div>');
      elem.style.left = left;
    },800);

  }

  document.querySelector('.container .slider').addEventListener('mouseover', function(){
    clearInterval(slideOnThis);
  })

  document.querySelector('.container .slider').addEventListener('mouseleave', function(){
    setTimeout(() => {
      moveSlider();
      slideOnThis = setInterval(
        () => moveSlider(),
        3000
      );
    },500)
  })


  function getPropertyVal(elem,property){
    return window.getComputedStyle(elem,null).getPropertyValue(property)
  }


})
