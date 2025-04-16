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

//пагинация картинок в секции banner
document.addEventListener('DOMContentLoaded', function () {
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

//BMI calc
let activityFactor;
switch (document.getElementById("activity-factor").value) {
  case "Little": {
    activityFactor = 1.2;
    break;
  }
  case "Light": {
    activityFactor = 1.375;
    break;
  }
  case "Moderate": {
    activityFactor = 1.55;
    break;
  }
  case "Heavy": {
    activityFactor = 1.725;
    break;
  }
  case "Very heavy": {
    activityFactor = 1.9;
    break;
  }
  default: {
    activityFactor = 1.2;
    break;
  }
}

let bmiStatus;

//валидация ввода веса и роста
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

age.addEventListener('input', function(e) {
  if (document.activeElement === age) {
    console.log(document.activeElement.selectionStart);
  }
});
/*
document.addEventListener('focusin', () => {
  const el = document.activeElement;
  if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
    console.log(`В фокусе: ${el.className || el.name || el.id}`);
    console.log('Курсор на позиции:', el.selectionStart);
  }
});
*/
/*
document.querySelectorAll('.calculate-input-digits-float').forEach(input => {

  input.addEventListener('keydown', function (e) {
    const value = this.value;
    const key = e.key;
    const cursorPos = this.selectionStart;
    const isNumber = /^[0-9]$/.test(key);
    const isDot = key === '.' || key === ',';
    const hasSeparator = value.includes('.') || value.includes(',');
    const separatorIndex = value.search(/[.,]/);
    const isAfterSeparator = separatorIndex !== -1 && cursorPos > separatorIndex;

    // Разрешаем только системные клавиши (копирование, навигация и т.д.)
    if (e.ctrlKey || e.metaKey || e.altKey || ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End'].includes(key)) {
      return;
    }

    // Приводим запятую к точке в момент ввода
    if (isDot) {
      // Блокируем точку, если она уже есть или если вводим её в начале строки
      if (hasSeparator || cursorPos === 0 || !/\d/.test(value)) {
        e.preventDefault();
      }
    }

    // Ограничиваем на 2 цифры после точки
    if (isNumber && isAfterSeparator) {
      const afterPart = value.split(/[.,]/)[1] || '';
      if (afterPart.length >= 2) {
        e.preventDefault();
      }
    }
  });

  input.addEventListener('input', function () {
    const original = this.value;

    // Преобразуем все запятые в точки
    let replaced = original.replace(/,/g, '.');

    // Очищаем только цифры и одну точку
    let cleaned = '';
    let dotUsed = false;

    for (let i = 0; i < replaced.length; i++) {
      const char = replaced[i];
      if (char === '.' && !dotUsed) {
        cleaned += '.';
        dotUsed = true;
      } else if (/\d/.test(char)) {
        cleaned += char;
      }
    }

    // Обрезаем дробную часть до 2 знаков после точки
    if (cleaned.includes('.')) {
      const [intPart, decPart] = cleaned.split('.');
      cleaned = intPart + '.' + decPart.slice(0, 2);
    }

    // Обновляем значение в поле
    if (cleaned !== this.value) {
      this.value = cleaned;
    }
  });
});
*/
//убирать нули и точки в начале и точки в конце