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