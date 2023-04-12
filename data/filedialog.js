// FileDialog.js
export default class FileDialog {
  constructor(storage) {
    this.storage = storage;
    this.curFileName = "nodework_0"
    this.curFile;
    this.modal = null;
    this.createModal();
    this.updateList();
  }

  saveToStorage() {
    this.storage.files = JSON.stringify(this.files);

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
    this.files = this.parseJson(this.storage.files);
    if (Object.keys(this.files).length > 0) {
      this.curFileName = Object.keys(this.files)[0]
      this.curFile = this.files[this.curFileName]
    }

    if (this.files == null) {
      this.files = {}
      this.files[this.curFileName] ={}
      this.saveToStorage();
    }
    this.storage.selected = this.curFileName
    this.modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>Files</h2>
          <span class="close">&times;</span>
        </div>
        <div class="modal-body">
          ${Object.keys(this.files).map(file => `
            <div class="file">
              <div class="filename">${file}</div>
              <div class="rename"><svg width="48px" height="48px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M9 5H14M14 5H19M14 5V19M9 19H14M14 19H19" stroke="#222222"></path> <path d="M11 9H4C2.89543 9 2 9.89543 2 11V15H11" stroke="#222222"></path> <path d="M17 15H20C21.1046 15 22 14.1046 22 13V9H17" stroke="#222222"></path> </g></svg></div>
              <div class="remove"><svg width="32px" height="32px" viewBox="0 0 1024 1024" class="icon" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M960 160h-291.2a160 160 0 0 0-313.6 0H64a32 32 0 0 0 0 64h896a32 32 0 0 0 0-64zM512 96a96 96 0 0 1 90.24 64h-180.48A96 96 0 0 1 512 96zM844.16 290.56a32 32 0 0 0-34.88 6.72A32 32 0 0 0 800 320a32 32 0 1 0 64 0 33.6 33.6 0 0 0-9.28-22.72 32 32 0 0 0-10.56-6.72zM832 416a32 32 0 0 0-32 32v96a32 32 0 0 0 64 0v-96a32 32 0 0 0-32-32zM832 640a32 32 0 0 0-32 32v224a32 32 0 0 1-32 32H256a32 32 0 0 1-32-32V320a32 32 0 0 0-64 0v576a96 96 0 0 0 96 96h512a96 96 0 0 0 96-96v-224a32 32 0 0 0-32-32z" fill="#231815"></path><path d="M384 768V352a32 32 0 0 0-64 0v416a32 32 0 0 0 64 0zM544 768V352a32 32 0 0 0-64 0v416a32 32 0 0 0 64 0zM704 768V352a32 32 0 0 0-64 0v416a32 32 0 0 0 64 0z" fill="#231815"></path></g></svg></div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
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

  remove(filename) {
    delete this.files[filename];
    this.storage.files = JSON.stringify(this.files)
    this.updateList();
  }

  rename(filename, deleteOld = true) {
    const newFilename = prompt('Enter new filename:', filename);
    if (newFilename && newFilename !== filename) {
      this.files[newFilename] = this.files[filename];
      if (deleteOld) {
        delete this.files[filename];
      }
    }
    this.storage.files = JSON.stringify(this.files)
    this.updateList();
    return newFilename;
  }

  select(filename) {
    this.close();
    if (typeof this.onFileSelected === 'function') {
      window.fileDialog.curFileName = filename
      this.onFileSelected(filename);
    }
  }
}
