(() => {
	const noItemsRow = `<tr class="text-center text-muted" id="emptyStudentsRow"><td colspan="5">Liste vide</td></tr>`;

	registerUiModule('klass-form', {
		jQuerySelector: '#klassModal',
		noItemsRow,
		$,
		bootstrap,
		studentService: setUpServices().studentService,
		utils: setUpUtils($),
	}, function (args) {
		return {
			//#region lifecycle methods
			onInit: function () {
				this.studentService = args.studentService;
				this.onSubmitListeners = [];
				this.AddStudentBtnClickedListeners = [];
				this.EditStudentBtnClickedListeners = [];
				this.DeleteStudentBtnClickedListeners = [];

				this.selectedSchool = null;
				this.selectedKlass = null;
				this.klassModal = new args.bootstrap.Modal(args.jQuerySelector);
				this.klassModalForm = args.$('#klassModal_form');
				this.studentTableBody = args.$('#studentTableBody');
				this.formElements = {
					title: $('#klassModal_title'),
					nameField: $('#klassModal_form_name'),
					programField: $('#klassModal_form_program'),
					profField: $('#klassModal_form_prof'),
					editIndex: $('#klassModal_form_editIndex'),
					submitBtn: $('#klassModal_form_submitBtn'),
					addStudentBtn: $('#klassModal_addStudentBtn'),
				};
				
				// Submit a Klass
				this.klassModalForm.on('submit', this.onSubmit.bind(this));

				// Add a Student
				this.formElements.addStudentBtn.click(this.onAddStudentBtnClicked.bind(this));
				// Edit a Student
				this.studentTableBody.on('click', '.editBtn', async (e) => {
					const studentId = $(e.target).data('id') || -1;
					const student = await this.studentService.getStudentById(this.selectedSchool?.id, this.selectedKlass?.id, studentId);
					this.onEditStudentBtnClicked(student);
				});
				// Delete a Student
				this.studentTableBody.on('click', '.deleteBtn', async (e) => {
					const studentId = $(e.target).data('id') || -1;
					const student = await this.studentService.getStudentById(this.selectedSchool?.id, this.selectedKlass?.id, studentId);
					this.onDeleteStudentBtnClicked(student);
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
			addAddStudentBtnClickedListener: function (listener) {
				if (!this.AddStudentBtnClickedListeners) {
					this.AddStudentBtnClickedListeners = [];
				}
				this.AddStudentBtnClickedListeners.push(listener);
			},
			removeAddStudentBtnClickedListener: function (listener) {
				if (!this.AddStudentBtnClickedListeners) {
					this.AddStudentBtnClickedListeners = [];
				}
				this.AddStudentBtnClickedListeners = this.AddStudentBtnClickedListeners.filter((l) => l !== listener);
			},
			addEditStudentBtnClickedListener: function (listener) {
				if (!this.EditStudentBtnClickedListeners) {
					this.EditStudentBtnClickedListeners = [];
				}
				this.EditStudentBtnClickedListeners.push(listener);
			},
			removeEditStudentBtnClickedListener: function (listener) {
				if (!this.EditStudentBtnClickedListeners) {
					this.EditStudentBtnClickedListeners = [];
				}
				this.EditStudentBtnClickedListeners = this.EditStudentBtnClickedListeners.filter((l) => l !== listener);
			},
			addDeleteStudentBtnClickedListener: function (listener) {
				if (!this.DeleteStudentBtnClickedListeners) {
					this.DeleteStudentBtnClickedListeners = [];
				}
				this.DeleteStudentBtnClickedListeners.push(listener);
			},
			removeDeleteStudentBtnClickedListener: function (listener) {
				if (!this.DeleteStudentBtnClickedListeners) {
					this.DeleteStudentBtnClickedListeners = [];
				}
				this.DeleteStudentBtnClickedListeners = this.DeleteStudentBtnClickedListeners.filter((l) => l !== listener);
			},
			//#endregion

			//#region UI Actions
			renderStudentListRowAsString: function (student) {
				return (`
					<tr data-id="${student.id}">
						<td>${student.lastName}</td>
						<td>${student.firstName}</td>
						<td>${student.dateOfBirth}</td>
						<td>${student.gender}</td>
						<td>
							<button type="button" class="btn btn-secondary btn-sm me-2 editBtn" data-id="${student.id}">Modifier</button>
							<button type="button" class="btn btn-danger btn-sm deleteBtn" data-id="${student.id}">Supprimer</button>
						</td>
					</tr>
				`);
			},
			renderStudentList: async function (schoolId, klassId) {
				const students = await this.studentService.listStudents(schoolId, klassId);
				this.studentTableBody.empty();

				if (students.length === 0) {
					this.studentTableBody.append(args.noItemsRow);
					return;
				}

				const rowsAsString = students.map((student) => this.renderStudentListRowAsString(student)).join('');
				this.studentTableBody.append(rowsAsString);
			},
			insertRow: function (student) {
				const rowAsString = this.renderStudentListRowAsString(student);
				const rows = this.studentTableBody.find(`tr[data-id="${student.id}"]`);
				if (rows.length > 0) {
					rows.replaceWith(rowAsString);
				} else {
					// If no rows exist, remove the empty row message.
					this.studentTableBody.find('#emptyStudentsRow').remove();
					this.studentTableBody.append(rowAsString);
				}
			},
			removeRow: function (student) {
				this.studentTableBody.find(`tr[data-id="${student.id}"]`).remove();
				if (this.studentTableBody.find('tr').length === 0) {
					this.studentTableBody.append(args.noItemsRow);
				}
			},
			show: async function ({ school, klass, mode = 'create' }) {
				this.selectedSchool = school;
				this.selectedKlass = klass;
				this.klassModalForm[0].reset();

				const { nameField, programField, profField } = this.formElements;
				args.utils.resetValidation({ nameField, programField, profField });

				switch (mode) {
					case 'edit':
						this.formElements.title.text('Modifier une classe');
						this.formElements.submitBtn.text('Modifier');
						this.formElements.nameField.val(klass.name);
						this.formElements.programField.val(klass.program);
						this.formElements.profField.val(klass.prof);
						this.formElements.addStudentBtn.removeClass('disabled');
						this.formElements.addStudentBtn.prop('disabled', false);
						break;
					case 'create':
					default:
						this.formElements.title.text('Ajouter une classe');
						this.formElements.submitBtn.text('Enregistrer');
						this.formElements.addStudentBtn.addClass('disabled');
						this.formElements.addStudentBtn.prop('disabled', true);
						break;
				}

				this.renderStudentList(this.selectedSchool?.id, this.selectedKlass?.id);
				this.klassModal.show();
			},
			hide: function () {
				this.klassModal.hide();
			},
			addStudent: async function (student) {
				const _student = await this.studentService.addStudent(this.selectedSchool?.id, this.selectedKlass?.id, student);
				this.insertRow(_student);
			},
			updateStudent: async function (student) {
				const _student = await this.studentService.updateStudentById(this.selectedSchool?.id, this.selectedKlass?.id, student.id, student);
				this.insertRow(_student);
			},
			deleteStudent: async function (student) {
				await this.studentService.deleteStudentById(this.selectedSchool?.id, this.selectedKlass?.id, student.id);
				this.removeRow(student);
			},
			//#endregion

			//#region call listeners
			onAddStudentBtnClicked: function () {
				this.AddStudentBtnClickedListeners.forEach((listener) => listener({
					school: this.selectedSchool,
					klass: this.selectedKlass,
				}));
			},
			onEditStudentBtnClicked: function (student) {
				this.EditStudentBtnClickedListeners.forEach((listener) => listener({
					school: this.selectedSchool,
					klass: this.selectedKlass,
					student,
				}));
			},
			onDeleteStudentBtnClicked: function (student) {
				this.DeleteStudentBtnClickedListeners.forEach((listener) => listener({
					school: this.selectedSchool,
					klass: this.selectedKlass,
					student,
				}));
			},
			onSubmit: async function (e) {
				e.preventDefault();
				const { nameField, programField, profField } = this.formElements;
				const isValid = args.utils.validateFields({ nameField, programField, profField });
				if (!isValid) {
					return;
				}

				const klassData = { name: nameField.val(), program: programField.val(), prof: profField.val() };
				if (Number(this.selectedKlass?.id) > 0) {
					klassData.id = Number(this.selectedKlass?.id);
				}

				this.onSubmitListeners.forEach((listener) => listener(klassData));
				this.klassModal.hide();
			},
			//#endregion
		};
	});
})();