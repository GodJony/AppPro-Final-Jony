$(document).ready(function () {
  $(".enroll-button").on("click", function () {
    $("#overlay").show();
  });

  $("#overlay").on("click", function () {
    $(this).hide();
  });
  let totalClicks = 0;
  let correctClicks = 0;

  // 모드에 따른 ACS 계산 변경을 위해 추가
  let currentMode = null;
  let totalTargetsSpawned = 0;
  let correctTargetsHit = 0;

  function enterShootingRange() {
    $("#aim-test-screen").removeClass("hidden").addClass("fullscreen");
    $(".mode-selection").removeClass("hidden");
    $("body > *:not(#aim-test-screen)").addClass("hidden");

    // 화면 크기에 맞춰 aim-test-screen 사이즈 및 배경 설정
    resizeAimTestScreen();
  }

  function resizeAimTestScreen() {
    $("#aim-test-screen").css({
      width: $(window).width() + "px",
      height: $(window).height() + "px",
      "background-image":
        "linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.2)), url('img/shoot.png')",
      "background-size": "cover",
      "background-position": "center center",
      "background-repeat": "no-repeat",
    });
  }

  function startMode(mode) {
    currentMode = mode;
    $(".mode-selection").addClass("hidden");
    $(".score-display, .timer-display, .acs-display").remove();

    // 배경 이미지 설정
    $("#aim-test-screen").css({
      "background-image": "url('img/shoot.png')",
      "background-size": "auto",
      "background-position": "top left",
      "background-repeat": "no-repeat",
      margin: "0",
    });

    const scoreDisplay = $('<div class="score-display">SCORE: 0</div>');
    const timerDisplay = $(
      '<div class="timer-display">TIME: ' +
        (mode === 2 ? "30s" : "60s") +
        "</div>"
    );
    const acsDisplay = $('<div class="acs-display">ACS: 100%</div>');
    $("body").append(scoreDisplay).append(timerDisplay).append(acsDisplay);

    // 점수와 정확도를 추적할 변수 초기화
    totalClicks = 0;
    correctClicks = 0;
    totalTargetsSpawned = 0;
    correctTargetsHit = 0;

    if (mode === 1) {
      startAimTestMode1();
    } else if (mode === 2) {
      startAimTestMode2();
    } else if (mode === 3) {
      startAimTestMode3();
    }
  }

  function updateACSDisplay() {
    let acs;
    if (currentMode === 1) {
      // 모드 1: (맞춘 공 수/출현한 공 수)*100
      if (totalTargetsSpawned === 0) {
        acs = 100; // 아직 공이 안나왔다면 100%로 표시
      } else {
        acs = Math.floor((correctTargetsHit / totalTargetsSpawned) * 100);
      }
    } else {
      // 모드 2,3: 기존 로직 (correctClicks/totalClicks)*100
      acs = totalClicks === 0 ? 100 : (correctClicks / totalClicks) * 100;
      acs = Math.floor(acs);
    }
    $(".acs-display").text(`ACS: ${acs}%`);
  }

  function startAimTestMode1() {
    let score = 0;
    const duration = 60000;
    let target;

    const createTarget = () => {
      if (target) target.remove();
      const size = Math.random() * (150 - 50) + 50;
      target = $('<div class="target"></div>').css({
        width: size + "px",
        height: size + "px",
        top: Math.random() * ($(window).height() - size) + "px",
        left: Math.random() * ($(window).width() - size) + "px",
      });
      totalTargetsSpawned++; // 공 출현 시 카운트 증가
      target.on("click", function (e) {
        e.stopPropagation();
        score++;
        correctTargetsHit++; // 공 맞춘 횟수 증가
        $(".score-display").text(`SCORE: ${score}`);
        updateACSDisplay();
        target.remove();
        target = null;
      });
      $("body").append(target);
      updateACSDisplay();
    };

    createTarget();
    const interval = setInterval(createTarget, 1000);
    const timerInterval = setInterval(() => {
      const remainingTime =
        parseInt(
          $(".timer-display").text().replace("TIME: ", "").replace("s", "")
        ) - 1;
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
      width: "75px",
      height: "75px",
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      backgroundColor: "red",
    });
    $("body").append(target);

    target.on("mousemove", function () {
      target.css("background-color", "blue");
    });

    target.on("mouseleave", function () {
      target.css("background-color", "red");
    });

    $("body")
      .off("click.notTarget")
      .on("click.notTarget", function (e) {
        if (!$(e.target).hasClass("target")) {
          totalClicks++;
          updateACSDisplay();
        }
      });

    const moveTargetContinuously = () => {
      let dx = Math.random() > 0.5 ? 400 : -400;
      let dy = Math.random() > 0.5 ? 400 : -400;

      const move = () => {
        let newLeft = parseInt(target.css("left")) + dx;
        let newTop = parseInt(target.css("top")) + dy;

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
      const remainingTime =
        parseInt(
          $(".timer-display").text().replace("TIME: ", "").replace("s", "")
        ) - 1;
      $(".timer-display").text(`TIME: ${remainingTime}s`);
      if (remainingTime <= 0) {
        clearInterval(timerInterval);
        target.stop();
        target.remove();
        endTest(score);
      }
    }, 1000);

    const trackInterval = setInterval(() => {
      if (target.css("background-color") === "rgb(0, 0, 255)") {
        score++;
        correctClicks++;
        totalClicks++;
        $(".score-display").text(`SCORE: ${score}`);
        updateACSDisplay();
      } else {
        totalClicks++;
        updateACSDisplay();
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

    $("body")
      .off("click.notTarget")
      .on("click.notTarget", function (e) {
        if (!$(e.target).hasClass("target")) {
          totalClicks++;
          updateACSDisplay();
        }
      });

    const createTarget = () => {
      if (trackingInProgress) return;
      trackingInProgress = true;
      target = $('<div class="target"></div>').css({
        width: "75px",
        height: "75px",
        top: Math.random() * ($(window).height() - 75) + "px",
        left: Math.random() * ($(window).width() - 75) + "px",
        backgroundColor: "red",
      });
      target.on("click", function (e) {
        e.stopPropagation();
        score++;
        correctClicks++;
        totalClicks++;
        $(".score-display").text(`SCORE: ${score}`);
        updateACSDisplay();
        startTracking(target);
      });
      $("body").append(target);
    };

    const startTracking = (target) => {
      target.on("mousemove", function () {
        target.css("background-color", "blue");
      });

      target.on("mouseleave", function () {
        target.css("background-color", "red");
      });

      let dx = Math.random() > 0.5 ? 400 : -400;
      let dy = Math.random() > 0.5 ? 400 : -400;

      const moveTargetContinuously = () => {
        const move = () => {
          let newLeft = parseInt(target.css("left")) + dx;
          let newTop = parseInt(target.css("top")) + dy;

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
        if (target.css("background-color") === "rgb(0, 0, 255)") {
          score++;
          correctClicks++;
          totalClicks++;
          $(".score-display").text(`SCORE: ${score}`);
          updateACSDisplay();
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
      const remainingTime =
        parseInt(
          $(".timer-display").text().replace("TIME: ", "").replace("s", "")
        ) - 1;
      $(".timer-display").text(`TIME: ${remainingTime}s`);
      if (remainingTime <= 0) {
        clearInterval(timerInterval);
        endTest(score);
      }
    }, 1000);
    setTimeout(() => {
      $(".target").remove();
      clearInterval(timerInterval);
      endTest(score);
    }, duration);
  }

  function endTest(score) {
    alert(`테스트 종료! 당신의 점수: ${score}`);
    $(".mode-selection").removeClass("hidden");
    $(".score-display, .timer-display, .acs-display").remove();
    $(".target").remove();
    $("#aim-test-screen").css("background-image", "");
    $("body > *:not(#aim-test-screen)").removeClass("hidden");
  }

  $("#aim-test-screen").click(function (event) {
    if (
      $(event.target).is("#aim-test-screen") &&
      $(".timer-display").length === 0
    ) {
      $("#aim-test-screen").addClass("hidden").removeClass("fullscreen");
      $("body > *:not(#aim-test-screen)").removeClass("hidden");
    } else {
      // 타겟이 아닌 곳 클릭 시 (모드 1에서는 ACS 계산 시 클릭 기반X)
      if (!$(event.target).hasClass("target")) {
        // 모드1에서는 ACS를 (맞춘 공/출현 공)로 계산하기 때문에 여기서는 totalClicks 증가하지 않음
        // 다른 모드 2,3 에서는 기존 로직 유지
        if (currentMode !== 1) {
          totalClicks++;
          updateACSDisplay();
        }
      }
    }
  });

  // ---------------------------------------------------------------------------------
  // PSA 감도 조절 로직 (기존 유지)
  // ---------------------------------------------------------------------------------
  let currentBase = null;
  let currentLow = null;
  let currentHigh = null;
  let selectionCount = 0;
  let finalSensitivity = null;

  $("#decimal-input").on("keypress", function (e) {
    if (e.which == 13) {
      let val = $(this).val();
      if (val && !isNaN(val)) {
        initializeSensitivity(val);
      }
    }
  });

  function initializeSensitivity(baseValue) {
    currentBase = parseFloat(baseValue);
    currentLow = currentBase / 2;
    currentHigh = currentBase;
    selectionCount = 0;
    finalSensitivity = null;
    showRadioButtons();
  }

  function updateSensitivity(choice) {
    selectionCount++;
    let oldBase = currentBase;
    let oldLow = currentLow;
    let oldHigh = currentHigh;

    if (choice === "high") {
      currentBase = oldBase + (oldBase - oldLow) / 2;
    } else {
      currentBase = oldBase - (oldHigh - oldBase) / 2;
    }

    if (choice === "high") {
      currentLow = (oldLow + currentBase) / 2;
      currentHigh = (oldHigh + currentBase) / 2;
    } else {
      currentHigh = (oldHigh + currentBase) / 2;
      currentLow = (oldLow + currentBase) / 2;
    }

    $("#decimal-input").val(currentBase.toFixed(3));

    if (selectionCount === 8) {
      finalSensitivity = currentBase;
      showFinalSensitivityButton();
    } else {
      showRadioButtons();
    }
  }

  function showRadioButtons() {
    let $radioContainer = $("#radio-container");
    if ($radioContainer.length === 0) {
      $radioContainer = $(
        '<div id="radio-container" style="position:absolute; top:' +
          (460 + 40 + 25) +
          'px; left:1132px; color:#fff; font-size:20px;"></div>'
      );
      $("body").append($radioContainer);
    }

    $radioContainer.empty();
    $radioContainer.append(
      '<input type="radio" name="sensitivity" value="high" id="radio-high">' +
        '<label for="radio-high"> 고감도 (' +
        currentHigh.toFixed(3) +
        ")</label><br>"
    );
    $radioContainer.append(
      '<input type="radio" name="sensitivity" value="low" id="radio-low">' +
        '<label for="radio-low"> 저감도 (' +
        currentLow.toFixed(3) +
        ")</label>"
    );

    $("input[name='sensitivity']")
      .off("change")
      .on("change", function () {
        let chosen = $(this).val();
        updateSensitivity(chosen);
      });
  }

  function showFinalSensitivityButton() {
    $("#radio-container").empty();
    $("#final-button").remove();

    const buttonTop = 414;
    const buttonLeft = 1132;

    const button = $(
      '<button id="final-button" style="position:absolute; top:' +
        buttonTop +
        "px; left:" +
        buttonLeft +
        'px; width:303px; height:40px; background-color:#de1c29; color:#ffffff; font-size:16px; border:none; border-radius:5px; cursor:pointer; z-index:999;">최종 감도 확인하기</button>'
    );

    $("body").append(button);

    $("#final-button")
      .off("click")
      .on("click", function () {
        showFinalMask();
      });
  }

  function showFinalMask() {
    const $mask = $(
      '<div id="final-mask" style="position:fixed; top:0; left:0; width:100%; height:100%; background-color:#000; opacity:0.8; z-index:9999;"></div>'
    );
    $("body").append($mask);

    const $textContainer = $(
      '<div style="position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); text-align:center; z-index:10000;"></div>'
    );
    const $title = $(
      '<div style="color:#ffffff; font-size:32px; margin-bottom:20px; font-family: Pretendard_Bold;">당신의 최종 감도는?</div>'
    );
    const $value = $(
      '<div style="color:#ffffff; font-size:28px; font-family: Pretendard_Bold;">' +
        finalSensitivity.toFixed(3) +
        "</div>"
    );

    $textContainer.append($title).append($value);
    $("body").append($textContainer);

    $mask.on("click", function () {
      $mask.remove();
      $textContainer.remove();
    });
  }

  window.enterShootingRange = enterShootingRange;
  window.startMode = startMode;
});
