(() => {
	const noItemsRow = `<tr class="text-center text-muted" id="emptyKlassesRow"><td colspan="5">Liste vide</td></tr>`;

	registerUiModule('school-form', {
		jQuerySelector: '#schoolModal',
		noItemsRow,
		$,
		bootstrap,
		klassService: setUpServices().klassService,
		utils: setUpUtils($),
	}, function (args) {
		return {
			//#region lifecycle methods
			onInit: function () {
				this.klassService = args.klassService;
				this.onSubmitListeners = [];
				this.AddKlassBtnClickedListeners = [];
				this.EditKlassBtnClickedListeners = [];
				this.DeleteKlassBtnClickedListeners = [];

				this.selectedSchool = null;
				this.schoolModal = new args.bootstrap.Modal(args.jQuerySelector);
				this.schoolModalForm = args.$('#schoolModal_form');
				this.klassTableBody = args.$('#klassTableBody');
				this.formElements = {
					title: $('#schoolModal_title'),
					nameField: $('#schoolModal_form_name'),
					quarterField: $('#schoolModal_form_quarter'),
					dateField: $('#schoolModal_form_date'),
					editIndex: $('#schoolModal_form_editIndex'),
					addKlassBtn: $('#schoolModal_addKlassBtn'),
					submitBtn: $('#schoolModal_form_submitBtn'),
				};

				// Submit a School
				this.schoolModalForm.on('submit', this.onSubmit.bind(this));

				// Add a Klass
				this.formElements.addKlassBtn.click(() => {
					args.utils.setQueryParams({ 'klass': '' });
					this.onAddKlassBtnClicked();
				});
				// Edit a Klass
				this.klassTableBody.on('click', '.editBtn', async (e) => {
					const klassId = $(e.target).data('id') || -1;
					const klass = await this.klassService.getKlassById(this.selectedSchool?.id, klassId);
					args.utils.setQueryParams({ 'klass': klassId });
					this.onEditKlassBtnClicked(klass);
				});
				// Delete a Klass
				this.klassTableBody.on('click', '.deleteBtn', async (e) => {
					const klassId = $(e.target).data('id') || -1;
					const klass = await this.klassService.getKlassById(this.selectedSchool?.id, klassId);
					this.onDeleteKlassBtnClicked(klass);
				});

				// Remove the 'school' query param when the schoolModal closes.
				args.$(args.jQuerySelector).on('hidden.bs.modal', () => {
					args.utils.removeQueryParam('school');
				});
			},
			onDestroy: function () { },
			//#endregion

			//#region register/unregister listeners
			addSubmitListener: function (listener) {
				if (!this.onSubmitListeners) {
					this.onSubmitListeners = [];
				}
				this.onSubmitListeners.push(listener);
			},
			removeSubmitListener: function (listener) {
				if (!this.onSubmitListeners) {
					this.onSubmitListeners = [];
				}
				this.onSubmitListeners = this.onSubmitListeners.filter((l) => l !== listener);
			},
			addAddKlassBtnClickedListener: function (listener) {
				if (!this.AddKlassBtnClickedListeners) {
					this.AddKlassBtnClickedListeners = [];
				}
				this.AddKlassBtnClickedListeners.push(listener);
			},
			removeAddKlassBtnClickedListener: function (listener) {
				if (!this.AddKlassBtnClickedListeners) {
					this.AddKlassBtnClickedListeners = [];
				}
				this.AddKlassBtnClickedListeners = this.AddKlassBtnClickedListeners.filter((l) => l !== listener);
			},
			addEditKlassBtnClickedListener: function (listener) {
				if (!this.EditKlassBtnClickedListeners) {
					this.EditKlassBtnClickedListeners = [];
				}
				this.EditKlassBtnClickedListeners.push(listener);
			},
			removeEditKlassBtnClickedListener: function (listener) {
				if (!this.EditKlassBtnClickedListeners) {
					this.EditKlassBtnClickedListeners = [];
				}
				this.EditKlassBtnClickedListeners = this.EditKlassBtnClickedListeners.filter((l) => l !== listener);
			},
			addDeleteKlassBtnClickedListener: function (listener) {
				if (!this.DeleteKlassBtnClickedListeners) {
					this.DeleteKlassBtnClickedListeners = [];
				}
				this.DeleteKlassBtnClickedListeners.push(listener);
			},
			removeDeleteKlassBtnClickedListener: function (listener) {
				if (!this.DeleteKlassBtnClickedListeners) {
					this.DeleteKlassBtnClickedListeners = [];
				}
				this.DeleteKlassBtnClickedListeners = this.DeleteKlassBtnClickedListeners.filter((l) => l !== listener);
			},
			//#endregion

			//#region UI Actions
			renderKlassListRowAsString: function (klass) {
				return `
				<tr data-id="${klass.id}">
					<td>${klass.name}</td>
					<td>${klass.program}</td>
					<td>${klass.prof}</td>
					<td>
						<button type="button" class="btn btn-secondary btn-sm me-2 editBtn" data-id="${klass.id}">Modifier</button>
						<button type="button" class="btn btn-danger btn-sm deleteBtn" data-id="${klass.id}">Supprimer</button>
					</td>
				</tr>
			`;
			},
			renderKlassList: async function (schoolId) {
				const klasses = await this.klassService.listKlasses(schoolId);
				this.klassTableBody.empty();

				if (klasses.length === 0) {
					this.klassTableBody.append(args.noItemsRow);
					return;
				}

				const rowsAsString = klasses.map((klass) => this.renderKlassListRowAsString(klass)).join('');
				this.klassTableBody.append(rowsAsString);
			},
			insertRow: function (klass) {
				const rowAsString = this.renderKlassListRowAsString(klass);
				const rows = this.klassTableBody.find(`tr[data-id="${klass.id}"]`);
				if (rows.length > 0) {
					rows.replaceWith(rowAsString);
				} else {
					// If no rows exist, remove the empty row message.
					this.klassTableBody.find('#emptyKlassesRow').remove();
					this.klassTableBody.append(rowAsString);
				}
			},
			removeRow: function (klass) {
				this.klassTableBody.find(`tr[data-id="${klass.id}"]`).remove();
				if (this.klassTableBody.find('tr').length === 0) {
					this.klassTableBody.append(args.noItemsRow);
				}
			},
			show: async function ({ school, mode = 'create' }) {
				this.selectedSchool = school;
				this.schoolModalForm[0].reset();
				const { nameField, quarterField, dateField } = this.formElements;
				args.utils.resetValidation({ nameField, quarterField, dateField });

				switch (mode) {
					case 'edit':
						this.formElements.title.text('Modifier un établissement');
						this.formElements.submitBtn.text('Modifier');
						this.formElements.nameField.val(school.name);
						this.formElements.quarterField.val(school.quarter);
						this.formElements.dateField.val(school.dateCreated);
						this.formElements.addKlassBtn.removeClass('disabled');
						this.formElements.addKlassBtn.prop('disabled', false);
						break;
					case 'create':
					default:
						this.formElements.title.text('Ajouter un établissement');
						this.formElements.submitBtn.text('Enregistrer');
						this.formElements.addKlassBtn.addClass('disabled');
						this.formElements.addKlassBtn.prop('disabled', true);
						break;
				}

				this.schoolModal.show();
				await this.renderKlassList(this.selectedSchool?.id);

				const query = args.utils.getQueryParams();
				if (query.hasOwnProperty('klass') && query.klass === undefined) {
					this.addKlassBtn.click();
				} else if (query.hasOwnProperty('klass') && !!query.klass) {
					this.klassTableBody.find(`.editBtn[data-id="${query.klass}"`).click();
				}
			},
			hide: function () {
				this.klassModal.hide();
			},
			addKlass: async function (klass) {
				const _klass = await this.klassService.addKlass(this.selectedSchool?.id, klass);
				this.insertRow(_klass);
			},
			updateKlass: async function (klass) {
				const _klass = await this.klassService.updateKlassById(this.selectedSchool?.id, klass.id, klass);
				this.insertRow(_klass);
			},
			deleteKlass: async function (klass) {
				await this.klassService.deleteKlassById(this.selectedSchool?.id, klass.id);
				this.removeRow(klass);
			},
			//#endregion

			//#region call listeners
			onAddKlassBtnClicked: function () {
				this.AddKlassBtnClickedListeners.forEach((listener) => listener({ school: this.selectedSchool }));
			},
			onEditKlassBtnClicked: function (klass) {
				this.EditKlassBtnClickedListeners.forEach((listener) => listener({ klass, school: this.selectedSchool }));
			},
			onDeleteKlassBtnClicked: function (klass) {
				this.DeleteKlassBtnClickedListeners.forEach((listener) => listener({ klass, school: this.selectedSchool }));
			},
			onSubmit: async function (e) {
				e.preventDefault();
				const { nameField, quarterField, dateField } = this.formElements;
				const isValid = args.utils.validateFields({ nameField, quarterField, dateField });
				if (!isValid) {
					return;
				}

				const schoolData = { name: nameField.val(), quarter: quarterField.val(), dateCreated: dateField.val() };
				if (Number(this.selectedSchool?.id) > 0) {
					schoolData.id = Number(this.selectedSchool?.id);
				}
				this.selectedSchool = schoolData;

				this.onSubmitListeners.forEach((listener) => listener(this.selectedSchool));
				this.schoolModal.hide();
			},
			//#endregion
		};
	});
})();