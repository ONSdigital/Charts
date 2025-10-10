let grid = d3.select("#grid");
let url = "https://onsdigital.github.io/Charts/";
let list = d3.select("#list");
import chartConfig from "./chartConfig.js";

// Helper function to create data download links
function createDataDownloadLinks(container, chart) {
  const dataDiv = container.append("div")
    .attr("id", `data${chart.name.replace(/\s/g, "")}`);
    
  chart.dataFiles.forEach(file => {
    const downloadLink = `<a href="${chart.url}${file.path}" download>${file.name === "data.csv" ? "Download the data csv file" : `Download ${file.name}`}</a>`;
    dataDiv.append("p").html(downloadLink);
  });
  
  return dataDiv;
}


/* SLOW SCROLL (ON SOME BROWSERS) */

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();

    document.querySelector(this.getAttribute("href")).scrollIntoView({
      behavior: "smooth",
    });
  });
});

/*GET SCREENSHOT THUMBNAIL*/

function analyticsEvent(props) {
  if (window.dataLayer) window.dataLayer.push(props);
}

function dataURLtoFile(dataurl, filename) {
  var arr = dataurl.split(","),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]),
    n = bstr.length,
    u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

function downloadImage(el) {
  console.log(el);
  let content = el.contentWindow.document.body;
  // let heading=document.createElement("h3")
  //console.log(text, body);
  // heading.innerText=text;

  // console.log(content)
  // content.id="chart";
  // document.body.appendChild(content)
  let chart = content;

  html2canvas(chart, { scale: 4 }) //SCALE TO MAKE SMALLER
    .then((canvas) => {
      // canvas.toBlob(function(blob) {
      // 	const item = new ClipboardItem({ "image/png": blob });
      // 	navigator.clipboard.write([item]).then(function(x) {
      // 		alert("Image copied to clipboard");
      // 	  });
      // });

      const dataURL = canvas.toDataURL("image/png", 1.0);
      console.log(dataURL);
      const file = dataURLtoFile(dataURL);

      return dataURL;
    })
    .then((url) => {
      console.log(url);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `chart.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    })
    .catch((e) =>
      alert("sorry, the download was unsuccessful: " + e + " (" + chart + ")")
    );
}

/*
  <button
    class="btn-link"
    on:click={function () {
      downloadImage(rows.title.replace(/\s/g, '').replace('#', '') + 'chart')
    }}>
    {'Save as image (PNG <100KB)'}
  </button> |
*/

window.filterSelection = function(c) {
  var x, i;
  x = document.getElementsByClassName("container");
  if (c == "all") c = "";
  // Add the "show" class (display:block) to the filtered elements, and remove the "show" class from the elements that are not selected
  for (i = 0; i < x.length; i++) {
    w3RemoveClass(x[i], "show");
    if (x[i].className.indexOf(c) > -1) w3AddClass(x[i], "show");
  }
}

// Show filtered elements
function w3AddClass(element, name) {
  // console.log(element)
  var i, arr1, arr2;
  arr1 = element.className.split(" ");
  arr2 = name.split(" ");
  for (i = 0; i < arr2.length; i++) {
    if (arr1.indexOf(arr2[i]) == -1) {
      element.className += " " + arr2[i];
    }
  }
}

// Hide elements that are not selected
function w3RemoveClass(element, name) {
  var i, arr1, arr2;
  arr1 = element.className.split(" ");
  arr2 = name.split(" ");
  for (i = 0; i < arr2.length; i++) {
    while (arr1.indexOf(arr2[i]) > -1) {
      arr1.splice(arr1.indexOf(arr2[i]), 1);
    }
  }
  element.className = arr1.join(" ");
}

// Add active class to the current control button (highlight it)
var btnContainer = document.getElementById("myBtnContainer");
var btns = btnContainer.getElementsByClassName("btn");
for (var i = 0; i < btns.length; i++) {
  btns[i].addEventListener("click", function () {
    var current = document.getElementsByClassName("active");
    current[0].className = current[0].className.replace(" active", "");
    this.className += " active";
  });
}

function drawGraphic() {
  for (let i = 0; i < chartConfig.length; i++) {
    const chart = chartConfig[i];
    
    // Create container
    const container = grid.append("div")
      .attr("id", `container${i}`)
      .attr("class", "container");
      
    // Add tags as classes
    Object.entries(chart.tags).forEach(([tag, value]) => {
      if (value) container.classed(tag, true);
    });
    
    // Add title
    container.append("div")
      .attr("id", `title${i}`)
      .attr("class", "title-div")
      .text(chart.name);
      
    // Add chart container
    container.append("div")
      .attr("id", `chart${i}`)
      .attr("class", "chart");
      
    container.append("br");
    
    // Add data download section
    createDataDownloadLinks(container, chart);
    
    container.append("br");
    
    // Add view full chart button
    container.append("button")
      .attr("type", "button")
      .attr("id", `btn${i}`)
      .text("View full chart");
    
    // Add modal
    const modal = container.append("div")
      .attr("id", `modal${i}`)
      .attr("class", "modal")
      .style("display", "none")
      .append("div")
      .attr("class", "modal-content")
      .html(`
        <span id='close${i}' class="close">&times;</span>
        <p>Take a screenshot of this to use as a placeholder in your draft publication</p><br>
        <div class='title-div'>${chart.name}</div>
        <div id='modal-chart${i}'>Chart ${i}</div>
      `);
      
    // Modal functionality
    const btn = d3.select(`#btn${i}`);
    const span = d3.select(`#close${i}`);
    
    btn.on("click", function() {
      d3.select(`#modal${i}`).style("display", "block");
      let pymParent1 = new pym.Parent(`modal-chart${i}`, chart.url, {});
    });
    
    span.on("click", function() {
      d3.select(`#modal${i}`).style("display", "none");
    });
    
    // Initialize Pym for main chart
    let pymParent = new pym.Parent(`chart${i}`, chart.url, {});
  }
  
  // Initialize filtering
  filterSelection("all");
  
  // Add window click handler for modals
  window.onclick = function(event) {
    if (event.target.firstChild?.className === "modal-content") {
      d3.select(event.target).style("display", "none");
    }
  };
}

d3.select("body").append("div").html(`<a href=#top>🠕 Back to the top</a>`);
drawGraphic();