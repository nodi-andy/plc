

export default class NodeDialog {
  constructor(nodes) {
    this.nodes = nodes;
    this.modal = null;
    this.createModal();
    this.onNodeSelected;
  }

  
  createModal() {
    this.modal = document.createElement('div');
    this.modal.innerHTML = `
      <div id="modal1" class="modal">
        <div id = "modalContent" class="modal-content">
        </div>
        <div class="modal-footer">
          <a href="#!" class="modal-close waves-effect waves-green btn-flat">Close</a>
        </div>
      </div>`;
    document.body.appendChild(this.modal);
  
		let modalCont = document.getElementById("modalContent");

		let tabData = document.createElement('div');
    let tabString = '<ul id="tabs-swipe-demo" class="tabs grey lighten-4">'
    for (const [index, key] of Object.keys(this.nodes).entries()) {
      tabString +=  `<li class="tab col s3 grey lighten-4"><a href="#test-swipe-${index}" class = "black-text text-darken-2">${key}</a></li>`
    }
    tabString += '</ul>'

    for (const [index, key] of Object.keys(this.nodes).entries()) {
      tabString +=  `<div id="test-swipe-${index}" class="col s12">`
      tabString += `<div id="${key}-collection" class="collection">`
      tabString += `</div>`
      tabString += `</div>`
    }

    tabData.innerHTML = tabString;
		modalCont.appendChild(tabData);

    for (const [index, key] of Object.keys(this.nodes).entries()) {
      let nodeCollection = document.getElementById(key+"-collection");
      for (const nodeName of this.nodes[key]) {
        let btn = document.createElement("a");
        btn.classList.add("collection-item")
        btn.classList.add("modal-close")
        btn.innerHTML = nodeName
        btn.nodeCatName = key+"/"+nodeName
        btn.onclick = () => this.onNodeSelected(btn.nodeCatName);
        nodeCollection.appendChild(btn)
      }
    }


 }


}
