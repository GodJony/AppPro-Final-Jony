$(document).ready(function() {
  function enterShootingRange() {
    $("#aim-test-screen").removeClass("hidden").addClass("fullscreen");
    $(".mode-selection").removeClass("hidden");
    $("body > *:not(#aim-test-screen)").addClass("hidden");
  }

  function startMode(mode) {
    $(".mode-selection").addClass("hidden");
    $(".score-display, .timer-display").remove();
    const scoreDisplay = $('<div class="score-display">SCORE: 0</div>');
    const timerDisplay = $('<div class="timer-display">TIME: ' + (mode === 2 ? '30s' : '60s') + '</div>');
    $('body').append(scoreDisplay).append(timerDisplay);
    
    if (mode === 1) {
      startAimTestMode1();
    } else if (mode === 2) {
      startAimTestMode2();
    } else if (mode === 3) {
      startAimTestMode3();
    }
  }

  function startAimTestMode1() {
    let score = 0;
    const duration = 60000;
    let target;

    const createTarget = () => {
      if (target) target.remove();
      const size = Math.random() * (150 - 50) + 50;
      target = $('<div class="target"></div>').css({
        width: size + 'px',
        height: size + 'px',
        top: Math.random() * ($(window).height() - size) + 'px',
        left: Math.random() * ($(window).width() - size) + 'px',
      });
      target.on('click', function() {
        score++;
        target.remove();
        target = null;
        $(".score-display").text(`SCORE: ${score}`);
      });
      $('body').append(target);
    };
    createTarget();
    const interval = setInterval(createTarget, 1000);
    const timerInterval = setInterval(() => {
      const remainingTime = parseInt($(".timer-display").text().replace("TIME: ", "").replace("s", "")) - 1;
      $(".timer-display").text(`TIME: ${remainingTime}s`);
      if (remainingTime <= 0) {
        clearInterval(interval);
        clearInterval(timerInterval);
        endTest(score);
      }
    }, 1000);
    setTimeout(() => {
      clearInterval(interval);
      clearInterval(timerInterval);
      endTest(score);
    }, duration);
  }

  function startAimTestMode2() {
    let score = 0;
    const duration = 30000;
    const target = $('<div class="target"></div>').css({
      width: '75px',
      height: '75px',
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: 'red'
    });
    $('body').append(target);

    target.on('mousemove', function() {
      target.css('background-color', 'blue');
    });

    target.on('mouseleave', function() {
      target.css('background-color', 'red');
    });

    const moveTargetContinuously = () => {
      let dx = Math.random() > 0.5 ? 400 : -400;
      let dy = Math.random() > 0.5 ? 400 : -400;

      const move = () => {
        let newLeft = parseInt(target.css('left')) + dx;
        let newTop = parseInt(target.css('top')) + dy;

        // Reverse direction if out of bounds
        if (newLeft < 0 || newLeft > $(window).width() - target.width()) {
          dx = -dx;
        }
        if (newTop < 0 || newTop > $(window).height() - target.height()) {
          dy = -dy;
        }

        target.animate({ left: `+=${dx}px`, top: `+=${dy}px` }, 1500, move);
      };
      move();
    };
    moveTargetContinuously();

    const timerInterval = setInterval(() => {
      const remainingTime = parseInt($(".timer-display").text().replace("TIME: ", "").replace("s", "")) - 1;
      $(".timer-display").text(`TIME: ${remainingTime}s`);
      if (remainingTime <= 0) {
        clearInterval(timerInterval);
        target.stop();
        target.remove();
        endTest(score);
      }
    }, 1000);

    const trackInterval = setInterval(() => {
      if (target.css('background-color') === 'rgb(0, 0, 255)') {
        score++;
        $(".score-display").text(`SCORE: ${score}`);
      }
    }, 100);

    setTimeout(() => {
      clearInterval(timerInterval);
      clearInterval(trackInterval);
      target.stop();
      target.remove();
      endTest(score);
    }, duration);
  }

  function startAimTestMode3() {
    let score = 0;
    let trackingInProgress = false;
    const duration = 60000;
    let target;

    const createTarget = () => {
      if (trackingInProgress) return;
      trackingInProgress = true;
      target = $('<div class="target"></div>').css({
        width: '75px',
        height: '75px',
        top: Math.random() * ($(window).height() - 75) + 'px',
        left: Math.random() * ($(window).width() - 75) + 'px',
        backgroundColor: 'red'
      });
      target.on('click', function() {
        score++;
        $(".score-display").text(`SCORE: ${score}`);
        startTracking(target);
      });
      $('body').append(target);
    };

    const startTracking = (target) => {
      target.on('mousemove', function() {
        target.css('background-color', 'blue');
      });

      target.on('mouseleave', function() {
        target.css('background-color', 'red');
      });

      let dx = Math.random() > 0.5 ? 400 : -400;
      let dy = Math.random() > 0.5 ? 400 : -400;

      const moveTargetContinuously = () => {
        const move = () => {
          let newLeft = parseInt(target.css('left')) + dx;
          let newTop = parseInt(target.css('top')) + dy;

          // Reverse direction if out of bounds
          if (newLeft < 0 || newLeft > $(window).width() - target.width()) {
            dx = -dx;
          }
          if (newTop < 0 || newTop > $(window).height() - target.height()) {
            dy = -dy;
          }

          target.animate({ left: `+=${dx}px`, top: `+=${dy}px` }, 1500, move);
        };
        move();
      };
      moveTargetContinuously();

      const trackInterval = setInterval(() => {
        if (target.css('background-color') === 'rgb(0, 0, 255)') {
          score++;
          $(".score-display").text(`SCORE: ${score}`);
        }
      }, 100);

      setTimeout(() => {
        clearInterval(trackInterval);
        target.stop();
        target.remove();
        trackingInProgress = false;
        createTarget();
      }, 3000);
    };

    createTarget();

    const timerInterval = setInterval(() => {
      const remainingTime = parseInt($(".timer-display").text().replace("TIME: ", "").replace("s", "")) - 1;
      $(".timer-display").text(`TIME: ${remainingTime}s`);
      if (remainingTime <= 0) {
        clearInterval(timerInterval);
        endTest(score);
      }
    }, 1000);
    setTimeout(() => {
      $('.target').remove();
      clearInterval(timerInterval);
      endTest(score);
    }, duration);
  }

  function endTest(score) {
    alert(`테스트 종료! 당신의 점수: ${score}`);
    $(".mode-selection").removeClass("hidden");
    $(".score-display, .timer-display").remove();
    $(".target").remove();
  }

  $("#aim-test-screen").click(function(event) {
    if ($(event.target).is("#aim-test-screen") && $(".timer-display").length === 0) {
      $("#aim-test-screen").addClass("hidden").removeClass("fullscreen");
      $("body > *:not(#aim-test-screen)").removeClass("hidden");
    }
  });

  // 추가된 코드
  $(".enroll-button").click(function() {
    $("#overlay").fadeIn();
  });

  $("#overlay").click(function() {
    $(this).fadeOut();
  });

  // Expose functions to global scope for HTML to access
  window.enterShootingRange = enterShootingRange;
  window.startMode = startMode;
});
