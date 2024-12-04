const sourceEl = document.getElementById('source');
const outputEl = document.getElementById('output');
const saveSourceBtn = document.getElementById('save-source');
const previousSlide = document.getElementById('previous-slide');
const nextSlide = document.getElementById('next-slide');
const _u = window.md2slides;

let activeIndex = 0;

// Add the 'download' attribute to buttons for IE10+ support
const isIE = /*@cc_on!@*/ false || !!document.documentMode;
if (isIE && navigator.msSaveOrOpenBlob) {
  saveSourceBtn.setAttribute('download', 'source.md');
  saveOutputBtn.setAttribute('download', 'output.html');
} else {
  // Add a polyfill for saving files in browsers that don't support the 'download' attribute
  const link = document.createElement('a');
  link.style.display = 'none';
  document.body.appendChild(link);

  function saveAs(blob, filename) {
    if (isIE && navigator.msSaveOrOpenBlob) {
      return navigator.msSaveOrOpenBlob(blob, filename);
    } else {
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
    }
  }
}

// Add event listeners for saving files
saveSourceBtn.addEventListener('click', () => {
  const textToSave = sourceEl.value;
  const blob = new Blob([textToSave], { type: 'text/markdown' });
  saveAs(blob, 'source.md');
});

function getParameter(source, styleString) {
  const regex = new RegExp(`\\[${styleString}\\]: <> \\(.*\\)`, 'gm');
  const match = source.match(regex);
  if (match)
    return match[0].slice(match[0].indexOf('(') + 1, match[0].lastIndexOf(')'));
  else return '';
}

function updateOutput() {
  try {
    let sources = sourceEl.value.split('\n===');
    let outputs = sources.map((x) => {
      return (
        '<div class="slide-wrapper"><div class="slide">' + _u.convertMarkdownToHTML(x) + '</div></div>'
      );
    });

    console.log(outputs);
    outputEl.innerHTML = outputs.join(' ').replace(
      /<div data-page-break="true" data-type="page-break"><\/div>/g,
      `</div><div data-page-break="true" data-type="page-break"></div><div class="slide">`
    );
  } catch (error) {
    outputEl.innerHTML = '<div style="color:red">Error parsing Markdown</div>';
  }
}

document.querySelector('#print-mode').addEventListener('click', () => {
  document.querySelectorAll('#editor, #buttons').forEach((element) => {
    element.style.display = 'none';
  });
  outputEl.childNodes.forEach((element) => {
    document.body.appendChild(element);
  });
  setTimeout(() => {
    alert("Now in print mode! Press 'B' to go back");
    window.print();
  }, 1000);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'b' || event.key === 'B') {
    document.querySelectorAll('.slide, #fixed-bg').forEach((element) => {
      element.remove();
    });
    document.querySelectorAll('#editor, #buttons').forEach((element) => {
      element.style.display = '';
    });
    updateOutput();
  }
});

// Add event listener for showing compiled HTML in output div
sourceEl.addEventListener('input', updateOutput);

previousSlide.addEventListener('click', () => {
  if (activeIndex > 0) {
    activeIndex--;
    updateActiveView();
  }
});

nextSlide.addEventListener('click', () => {
  if (activeIndex < getSlideCount() - 1) {
    activeIndex++;
    updateActiveView();
  }
});

function updateActiveView() {
  const slides = output.querySelectorAll('.slide');
  const currentSlide = slides[activeIndex];
  currentSlide.scrollIntoView({ behavior: 'smooth' });
}

function getSlideCount() {
  console.log(output.innerHTML);
  const count =
    output.innerHTML.split(
      '<div data-page-break="true" data-type="page-break"></div>'
    ).length;


  return count || 0;
}
