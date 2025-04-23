//BLOCK_1 слайдер в секции family

const slider = document.querySelector(".slider-wrapper");
const originalCount = slider.childElementCount;
//const originalCount = 5;

// Сохраняем оригинальные слайды
const originalSlides = Array.from(slider.children);

// 1. Создаем левую группу клонов в обратном порядке  
for (let i = originalCount - 1; i >= 0; i--) {
  const clone = originalSlides[i].cloneNode(true);
  slider.insertBefore(clone, slider.firstElementChild);
}

// 2. Создаем правую группу клонов (в обычном порядке)
originalSlides.forEach(slide => {
  const clone = slide.cloneNode(true);
  slider.appendChild(clone);
});

// 3. Устанавливаем начальное положение так, чтобы был виден первый оригинальный слайд
window.addEventListener("load", () => {
  const firstOriginal = slider.children[originalCount];
  slider.style.scrollBehavior = "auto";
  slider.scrollLeft = firstOriginal.offsetLeft;
});

// 4. Функция для проверки и корректировки бесконечной прокрутки
function checkInfiniteScroll() {
  const firstOriginal = slider.children[originalCount];
  const lastOriginal = slider.children[originalCount * 2 - 1];

  // Положение начала оригинальных слайдов
  const originalStart = firstOriginal.offsetLeft;
   // Положение, где заканчивается последний оригинальный слайд
  const originalEnd = lastOriginal.offsetLeft + lastOriginal.offsetWidth;
  //общfz ширина оригинальных слайдов
  const totalWidth = originalEnd - originalStart;

  /* Если прокрутка ушла слишком влево (до начала оригинальных) - 
  сбрасываем scrollLeft к концу оригинальных.*/
  if (slider.scrollLeft < originalStart) {
    slider.style.scrollBehavior = "auto";
    slider.scrollLeft += totalWidth;
  } 
  /* Если прокрутка ушла слишком вправо (за пределы оригинальных) - 
  сбрасываем scrollLeft к началу оригинальных слайдов*/
  else if (slider.scrollLeft >= originalEnd) {
    slider.style.scrollBehavior = "auto";
    slider.scrollLeft -= totalWidth;
  }
}

// 5. Эффект инерции
let isDragging = false;
let startX = 0, scrollStart = 0;
let lastX = 0, lastTime = 0;
let velocity = 0; //скорость перетаскивания
let momentumID = null;
const MAX_VELOCITY = 1; 

function dragStart(e) {
  isDragging = true;
  slider.style.cursor = "grabbing";
  // Отключаем плавное обновление, чтобы движения были мгновенными
  slider.style.scrollBehavior = "auto";

  //определения координаты X при нажатии мыши или касании
  const pageX = e.pageX || e.touches[0].pageX;
  startX = pageX;
  scrollStart = slider.scrollLeft;
  lastX = pageX;
  lastTime = performance.now();
  // Останавливаем предыдущий инерционный анимационный цикл
  cancelAnimationFrame(momentumID);
}

function dragMove(e) {
  if (!isDragging) return;
  e.preventDefault();
  const pageX = e.pageX || e.touches[0].pageX;
  slider.scrollLeft = scrollStart - (pageX - startX);

  // Вычисляем скорость (пикселей/мс)
  const now = performance.now();
  const dt = now - lastTime;
  if (dt > 0) {
    const dx = pageX - lastX;
    velocity = dx / dt; // px/ms
    if (Math.abs(velocity) > MAX_VELOCITY) {
      velocity = MAX_VELOCITY * Math.sign(velocity);
    }
    lastX = pageX;
    lastTime = now;
  }
}

function dragEnd() {
  isDragging = false;
  slider.style.cursor = "grab";
  // Запускаем эффект инерции
  applyMomentum();
}

function applyMomentum() {
    // Если скорость мала, прекращаем анимацию
  if (Math.abs(velocity) < 0.02) {
    velocity = 0; // Сбрасываем скорость
    checkInfiniteScroll(); // Проверяем границы после завершения инерции для работы бесконечной прокрутки
    return;
  }

   // Обновляем scrollLeft на основе скорости
  // Здесь умножаем скорость на 16 для приблизительного расчёта смещения за 16мс (1 кадр при 60fps)
  slider.scrollLeft -= velocity * 16;
  // Замедляем скорость (фрикция)
  velocity *= 0.95;

  checkInfiniteScroll();
  momentumID = requestAnimationFrame(applyMomentum);
}

// 6. Обработчики перетаскивания
slider.addEventListener("mousedown", dragStart);
slider.addEventListener("mousemove", dragMove);
slider.addEventListener("mouseup", dragEnd);
slider.addEventListener("mouseleave", () => { if (isDragging) dragEnd(); });
slider.addEventListener("touchstart", dragStart);
slider.addEventListener("touchmove", dragMove);
slider.addEventListener("touchend", dragEnd);
// Запускаем проверку бесконечной прокрутки при scroll, если не перетаскиваем
slider.addEventListener("scroll", () => {
  if (!isDragging) checkInfiniteScroll();
});


//BLOCK_2 пагинация картинок в секции banner
document.addEventListener('DOMContentLoaded', function () {
  //если, например, форма с сервером работает и туда уже пришли значения — чтобы сразу отрисовались cm/kg в калькуляторе bmi
  window.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.calculate-input').forEach(showUnits);
  });
  // применяем стили к плейсхолдерам в полях с выбором
  document.querySelectorAll('select.input').forEach(select => {
    const updateSelectStyle = () => {
      if (!select.value) {
        select.classList.add('placeholder');
      } else {
        select.classList.remove('placeholder');
      }
    };
  
    select.addEventListener('change', updateSelectStyle);
    updateSelectStyle(); 
  });

  const content = document.querySelector('.banner-images-list');
  const items = Array.from(content.getElementsByTagName('li'));
  const buttons = document.querySelectorAll('.banner-pagination-button');
  let currentPage = 0;
  let intervalId;

  function showPage(newPage) {
    if (newPage === currentPage) return;

    const prevItem = items[currentPage];
    const nextItem = items[newPage];

    prevItem.classList.remove('is-active');
    prevItem.classList.add('hidden');

    nextItem.classList.add('is-active');
    nextItem.classList.remove('hidden');

    currentPage = newPage;
    updateActiveButtonStates();
  }

  function updateActiveButtonStates() {
    buttons.forEach((button, index) => {
      button.classList.toggle('is-current', index === currentPage);
    });
  }

  buttons.forEach((button, index) => {
    button.addEventListener('click', () => {
      clearInterval(intervalId); // сбросить авто-перелистывание при ручном клике
      showPage(index);
      startAutoSlide(); // перезапустить
    });
  });

  function startAutoSlide() {
    intervalId = setInterval(() => {
      const nextPage = (currentPage + 1) % items.length;
      showPage(nextPage);
    }, 5000); // каждые 5 секунд
  }

  // Инициализация
  items.forEach((item, index) => {
    item.classList.add('hidden');
    if (index === currentPage) {
      item.classList.add('is-active');
      item.classList.remove('hidden');
    }
  });

  updateActiveButtonStates();
  startAutoSlide();
});

//BLOCK_3 BMI calc
//валидация ввода веса и роста
//первая версия валидации
/*
document.querySelectorAll('.calculate-input-digits-float').forEach(item => {
  item.addEventListener('keydown', function(e) {
    const delimiter = /[.,]/;
    if (
      e.key === 'Backspace' || e.key === 'Delete' || e.key === 'ArrowLeft' || e.key === 'ArrowRight' ||
      e.key === 'Tab' || e.key === 'Home' || e.key === 'End'
    ) return;
    else if ((/[.,]/.test(e.key)) && (!/\d/.test(this.value) || /[.,]/.test(this.value)) ) {
      e.preventDefault();  // Не допускаем повторения точек или точку в начале
    }
    else if ((/[.,]/.test(e.key)) && this.selectionStart > 0) {
      return;  // можно добавить разделитель в середину
    }
    else if (!/[0-9]|\.|\,/.test(e.key)) {
      e.preventDefault(); //не цифра или разделитель
    }
    else if (/[.,]\d{2,}/.test(this.value) && this.selectionStart > this.value.search(delimiter)) {
      e.preventDefault();//не более 2 знаков после разделителя
    }
    else if (/^(?:\d{3,}|\d{3,}[.,]\d{2,})$/.test(this.value)) {
      e.preventDefault(); //уже введено целое число из 3 цифр или дробное с целой частью из 2 цифр
    }
  });
});
// /^(?:\d{3,}|\d{3,}[.,]\d{2,})$/
const age = document.querySelector('.calculate-input-digits-int')
*/

//добавляем единицы измерения для юзабилити
function showUnits(input = {}) {
  const wrapper = input.parentElement;
  if (!wrapper) return;
  let unit = '';
  if (input.classList.contains('height')) unit = 'cm';
  else if (input.classList.contains('weight')) unit = 'kg';
  else if (input.classList.contains('age')) unit = 'years';
  if (input.value) {
    wrapper.setAttribute('data-unit', unit);
  } else {
    wrapper.removeAttribute('data-unit');
  }
  /*
  if (wrapper .classList.contains('height')) {
    input.value? wrapper .setAttribute('data-unit', 'cm') : wrapper .removeAttribute('data-unit', 'cm');
  } else if (input.classList.contains('weight')) {
    input.value? wrapper .setAttribute('data-unit', 'kg') : wrapper .removeAttribute('data-unit', 'kg');
  } else if (input.classList.contains('age')) {
    input.value? wrapper .setAttribute('data-unit', 'years') : wrapper .removeAttribute('data-unit', 'years');
  }
  */
}
//тултипы для ошибок
let isValid = true;
//ошибка валидации для скрытия модалки
function setError() {
  isValid = false;
  document.querySelector('.calculate-modal').classList.add('visually-hidden');//доделать
};

function markIncorrect(wrapper, key) {
  if (!wrapper) return;
  wrapper.classList.add('incorrect');
  
  switch (key) {
    case 'weight':
      wrapper.setAttribute('data-error', 'enter a value between 30 and 300 kg');
      break;
    case 'height':
      wrapper.setAttribute('data-error', 'enter a value between 50 and 250 cm');
      break;
    case 'age':
      wrapper.setAttribute('data-error', 'enter a value between 1 and 120 years');
      break;
    case 'gender':
      wrapper.setAttribute('data-error', 'Please select gender');
      break;
    case 'activity':
    wrapper.setAttribute('data-error', 'Please choose activity level');
      break;
  }
  setError();
}

//пост-валидация (при снятии фокуса)
const inputLimits = {
  weight: { min: 30, max: 300},
  height: { min: 50, max: 250},
  age:    { min: 1, max: 120}
};
//финальная валидация перед отправкой
const onSubmitValidate = (form) => {
  const inputs = {
    height: form.querySelector('.height'),
    weight: form.querySelector('.weight'),
    age: form.querySelector('.age'),
    gender: form.querySelector('.gender'),
    activity: form.querySelector('.activity'),
  };

  Object.entries(inputs).forEach(([key, input]) => {
    if (!input || input.value.trim() === '') {
      const wrapper = input.closest('.input-wrapper');
      markIncorrect(wrapper, key);
      //isValid = false;
    }
    //навешиваем обработчик на сброс старых ошибок
    input.addEventListener('change', () => {
      const wrapper = input.closest('.input-wrapper');
      input.classList.remove('incorrect');
      wrapper?.classList.remove('incorrect');
      wrapper?.removeAttribute('data-error');
    });
  });
  return isValid;
};

function validateFinalValue(input, options = {}) {
  const {
    maxIntDigits = 3,
    maxDecimalDigits = 2,
  } = options;
  const key = ['weight', 'height', 'age'].find(k => input.classList.contains(k));
  if (!key) return;
  const min = inputLimits[key].min;
  const max = inputLimits[key].max;
  const wrapper = input.closest('.input-wrapper');
  
  // Нормализуем запятую → точка, удаляем всё лишнее
  let rawValue = input.value.trim().replace(',', '.').replace(/[^0-9.]/g, '');

  if (rawValue === '') return; // Пусто — пропускаем
  let decimalDigits = maxDecimalDigits;
  if (/^\d+\.(0+)$/.test(rawValue) || Number.isInteger(parseFloat(rawValue))) {
    decimalDigits = 0;
  }
  let num = parseFloat(rawValue);
  if (isNaN(num)) {
    markIncorrect(wrapper, key);
    //input.classList.add('incorrect')
    return;
  }
  num = parseFloat(num.toFixed(decimalDigits)); // сохраняем как число
  input.value = num.toFixed(decimalDigits);
  if (num < min || num > max) {
    markIncorrect(wrapper, key);
    //input.classList.add('incorrect')
    return;
  }
  // Проверка длины целой и дробной части
  const [intPart, decimalPart = ''] = rawValue.split('.');
  if (intPart.length > maxIntDigits || decimalPart.length > maxDecimalDigits) {
    markIncorrect(wrapper, key);
    //input.classList.add('incorrect');
    return;
  }

  return;
 }
//упаковываем валидацию в кастомную функцию
function setupFloatInputValidation(selectorOrElements, options = {}) {
  const {
    maxIntDigits = 3,
    maxDecimalDigits = 2,
  } = options;

  const elements = typeof selectorOrElements === 'string'
    ? document.querySelectorAll(selectorOrElements)
    : selectorOrElements;

  const allowedKeys = [
    'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight',
    'Tab', 'Home', 'End'
  ];

  elements.forEach(input => {
    
    input.addEventListener('keydown', function (e) {
      //сбрасываем старые ошибки
      const wrapper = input.closest('.input-wrapper');
      input.classList.remove('incorrect');
      wrapper?.classList.remove('incorrect');
      wrapper?.removeAttribute('data-error');
      isValid = true;
      //input.classList.remove('incorrect');//сбрасываем класс с ошибкой

      const key = e.key;
      const value = this.value;
      const selectionStart = this.selectionStart;
      const selectionEnd = this.selectionEnd;
      const hasDelimiter = /[.,]/.test(value);
      const delimiterIndex = value.search(/[.,]/);
      const isSelection = selectionStart !== selectionEnd;

      // Разрешённые спец. клавиши
      if (allowedKeys.includes(key)) return;

      // Целочисленный режим — запрет на ввод разделителя
      if (maxDecimalDigits === 0 && /[.,]/.test(key)) {
        e.preventDefault();
        return;
      }

      // Разрешаем только цифры и (если не в целочисленном режиме) разделитель
      if (!/[0-9]/.test(key) && (!/[.,]/.test(key) || maxDecimalDigits === 0)) {
        e.preventDefault();
        return;
      }

      // Разделитель
      if (/[.,]/.test(key)) {
        // Нельзя вводить второй разделитель или в начало строки
        if (!/\d/.test(value) || hasDelimiter) {
          e.preventDefault();
          return;
        }
        // Можно, если курсор не в начале
        if (selectionStart === 0 && !isSelection) {
          e.preventDefault();
          return;
        }
        return; // разрешаем вставку
      }

      // Проверяем кол-во цифр до разделителя
      const plainValue = value.replace(/[.,]/, '');
      const intPart = hasDelimiter ? value.split(/[.,]/)[0] : value;
      if (intPart.length >= maxIntDigits && (!hasDelimiter || selectionStart <= delimiterIndex) && !isSelection) {
        e.preventDefault();
        return;
      }

      // Проверяем кол-во цифр после разделителя
      if (hasDelimiter && selectionStart > delimiterIndex) {
        const decimalPart = value.split(/[.,]/)[1] || '';
        if (decimalPart.length >= maxDecimalDigits && !isSelection) {
          e.preventDefault();
        }
      }
    });
    // input — финальная проверка и тултипы
    input.addEventListener('blur', () => {
      validateFinalValue(input, options);
    });
    //добавляем ед. измерения
    input.addEventListener('blur', () => {
      showUnits(input);
    });
  });
}
const countBmi = (form) => { 
  
  const inputs = {
    height: parseFloat(form.querySelector('.height').value),
    weight: parseFloat(form.querySelector('.weight').value),
    age: parseFloat(form.querySelector('.age').value),
    gender: form.querySelector('.gender').value,
    activity: form.querySelector('.activity').value,
  };
  const activities = {
    little: 1.2,
    light: 1.375,
    moderate: 1.55,
    heavy: 1.725,
    veryHeavy: 1.9,
  };
  const genders = {
    male: {base: 66, weightCoef: 13.7, heightCoef: 5, ageCoef: 6.8},
    female: {base: 655, weightCoef: 9.6, heightCoef: 1.8, ageCoef: 4.7},
  };
  const status = {
    Underweight: {min: 0, max: 18.4, src: "./icons/underweight.svg"},
    Healthy: {min: 18.5, max: 24.9, src: "./icons/healthy.svg"},
    Overweight: {min: 25.0, max: 29.9, src: "./icons/overweight.svg"},
    Obese: {min: 30, max: 999, src: "./icons/obese.svg"},
  };
  let bmiOutput = document.querySelector('.bmi-value-output');
  let bmrOutput = document.querySelector('.bmr-value-output');
  let bmraOutput = document.querySelector('.bmra-value-output');
  let statOutput = document.querySelector('.stat-output');
  const icon = document.querySelector('.calculate-modal-icon');
   
  /*
  Harris Benedict formula: 
  Women: BMR = 655 + (9.6 x weight in kg) + (1.8 x height in cm) - (4.7 x age in years)
  Men: BMR = 66 + (13.7 x weight in kg) + (5 x height in cm) - (6.8 x age in years)
  */
  const bmr = genders[inputs.gender].base + (genders[inputs.gender].weightCoef * inputs.weight) + (genders[inputs.gender].heightCoef * inputs.height) - (genders[inputs.gender].ageCoef * inputs.age);
  bmrOutput.innerHTML  = bmr.toFixed(1);
  
  const bmra = (bmr * activities[inputs.activity]);
  bmraOutput.innerHTML = bmra.toFixed(1);

  const bmi = inputs.weight / (Math.pow(inputs.height/100, 2));//height in meters
  bmiOutput.innerHTML = bmi.toFixed(1);

  Object.entries(status).forEach(([key, status]) => {
    if (bmi >= status.min &&  bmi <= status.max) {
      statOutput.innerHTML = String(key);
      icon.setAttribute('src', status.src);
    }
  });
  document.querySelector('.calculate-modal').classList.remove('visually-hidden');
}


setupFloatInputValidation('.calculate-input-digits-float', {
  maxIntDigits: 3,
  maxDecimalDigits: 2
});
setupFloatInputValidation('.calculate-input-digits-int', {
  maxIntDigits: 3,
  maxDecimalDigits: 0
});

document.querySelector('.calculate-form-button').addEventListener('click', function (e) {
  const form = document.querySelector('.calculate-form');
  if (!onSubmitValidate(form)) {
    e.preventDefault();
  }
  else {
    countBmi(form);
  }
});

document.querySelector('.close-modal').addEventListener('click', function (e) {
  document.querySelector('.calculate-modal').classList.add('visually-hidden');
});