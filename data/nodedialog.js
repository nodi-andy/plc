
import Swiper from 'https://cdn.jsdelivr.net/npm/swiper@9/swiper-bundle.esm.browser.min.js'

export default class NodeDialog {
  constructor(nodes) {
    this.nodes = nodes;
    this.curFileName = "nodework_0"
    this.curFile;
    this.modal = null;
    this.createModal();
    this.updateList();
  }

  saveToStorage() {
    this.storage.files = JSON.stringify(this.nodes);

  }
  parseJson(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      return parsed;
    } catch (error) {
      return null;
    }
  }
  

  createModal() {
    this.modal = document.createElement('div');
    this.modal.classList.add('modal');
    this.updateList();
    document.body.appendChild(this.modal);
    this.modal.style.display = 'none';
   
  }

  updateList() {
    if (Object.keys(this.nodes).length > 0) {
      this.curFileName = Object.keys(this.nodes)[0]
      this.curFile = this.nodes[this.curFileName]
    }

    if (this.nodes == null) {
      this.nodes = {}
      this.nodes[this.curFileName] ={}
      this.saveToStorage();
    }
    this.modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>Nodes</h2>
          <span class="close">&times;</span>
        </div>
        <div class="modal-body">
          ${Object.keys(this.nodes).map(file => `
            <div class="file">
              <div class="filename">${file}</div>
            </div>
          `).join('')}

        </div>
        <swiper-container>
        <swiper-slide>Slide 1</swiper-slide>
        <swiper-slide>Slide 2</swiper-slide>
        <swiper-slide>Slide 3</swiper-slide>
        <swiper-slide>Slide ...</swiper-slide>
      </swiper-container>
      </div>
    `;
    const swiper = new Swiper('.swiper', {
      // Optional parameters
      direction: 'vertical',
      loop: true,
    
      // If we need pagination
      pagination: {
        el: '.swiper-pagination',
      },
    
      // Navigation arrows
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
    
      // And if we need scrollbar
      scrollbar: {
        el: '.swiper-scrollbar',
      },
    });

    // Add event listeners
    const closeBtn = this.modal.querySelector('.close');
    closeBtn.addEventListener('click', this.close.bind(this));
    const fileBtns = this.modal.querySelectorAll('.file div');
    fileBtns.forEach(btn => {
      const filename = btn.parentElement.querySelector('.filename').textContent;
      switch (btn.className) {
        case 'remove':
          btn.addEventListener('click', () => this.remove(filename));
          break;
        case 'rename':
          btn.addEventListener('click', () => this.rename(filename));
          break;
        case 'filename':
          btn.addEventListener('click', () => this.select(filename));
          break;
      }
    });
  }
  open() {
    if (!this.modal) {
      this.createModal();
    }
    this.updateList();
    this.modal.style.display = 'flex';
  }

  close() {
    this.modal.style.display = 'none';
  }

  select(filename) {
    this.close();
    if (typeof this.onFileSelected === 'function') {
      window.fileDialog.curFileName = filename
      this.onFileSelected(filename);
    }
  }
}
