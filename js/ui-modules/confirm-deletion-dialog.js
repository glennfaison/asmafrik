(() => {
	registerUiModule('confirm-deletion-dialog', { jQuerySelector: '#deleteConfirmModal', $, bootstrap, }, function (args) {
		return {
			//#region lifecycle methods
			onInit: function () {
				this.deleteModal = new args.bootstrap.Modal(args.jQuerySelector);
				this.confirmBtn = args.$('#confirmDeleteBtn');
				this.item = null;
				this.itemType = '';

				this.confirmBtn.click(this.onConfirm.bind(this));
			},
			onDestroy: function () { },
			//#endregion

			//#region UI Actions
			show: async function ({ item, itemType }) {
				this.item = item;
				this.itemType = itemType;
				let deleteModalText;
				switch (itemType) {
					case 'school':
						deleteModalText = `Nom de l'établissement: ${item.name}`;
						break;
					case 'klass':
						deleteModalText = `Nom de la classe: ${item.name}`;
						break;
					case 'student':
						deleteModalText = `Nom de l'élève: ${item.lastName}`;
						break;
					default:
						deleteModalText = `Supprimer cet élément?`;
						break;
				}
				$(this.deleteModal._element).find('.modal-body').text(deleteModalText);
				this.deleteModal.show();
			},
			//#endregion

			//#region call listeners
			onConfirm: async function () {
				this.fireEvent('confirmBtnClicked', { item: this.item, itemType: this.itemType, });
				this.deleteModal.hide();
			},
			//#endregion
		};
	});
})();
