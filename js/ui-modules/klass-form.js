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
				this.formElements.addStudentBtn.click(() => {
					args.utils.setQueryParams({ 'student': '' });
					this.onAddStudentBtnClicked();
				});
				// Edit a Student
				this.studentTableBody.on('click', '.editBtn', async (e) => {
					const studentId = $(e.target).data('id') || -1;
					const student = await this.studentService.getStudentById(this.selectedSchool?.id, this.selectedKlass?.id, studentId);
					args.utils.setQueryParams({ 'student': studentId });
					this.onEditStudentBtnClicked(student);
				});
				// Delete a Student
				this.studentTableBody.on('click', '.deleteBtn', async (e) => {
					const studentId = $(e.target).data('id') || -1;
					const student = await this.studentService.getStudentById(this.selectedSchool?.id, this.selectedKlass?.id, studentId);
					this.onDeleteStudentBtnClicked(student);
				});

				// Remove the 'klass' query param when the klassModal closes.
				args.$(args.jQuerySelector).on('hidden.bs.modal', () => {
					args.utils.removeQueryParam('klass');
				});
			},
			onDestroy: function () { },
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

				this.klassModal.show();
				await this.renderStudentList(this.selectedSchool?.id, this.selectedKlass?.id);

				const query = args.utils.getQueryParams();
				if (query.hasOwnProperty('student') && query.student === undefined) {
					this.addStudentBtn.click();
				} else if (query.hasOwnProperty('student') && !!query.student) {
					this.studentTableBody.find(`.editBtn[data-id="${query.student}"`).click();
				}
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
				this.fireEvent('addStudentBtnClicked', { school: this.selectedSchool, klass: this.selectedKlass, });
			},
			onEditStudentBtnClicked: function (student) {
				this.fireEvent('editStudentBtnClicked', { school: this.selectedSchool, klass: this.selectedKlass, student });
			},
			onDeleteStudentBtnClicked: function (student) {
				this.fireEvent('deleteStudentBtnClicked', { school: this.selectedSchool, klass: this.selectedKlass, student });
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

				this.fireEvent('formSubmitted', klassData);
				this.klassModal.hide();
			},
			//#endregion
		};
	});
})();