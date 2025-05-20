(() => {
	registerUiModule('student-form', {
		jQuerySelector: '#studentModal',
		$,
		bootstrap,
		utils: setUpUtils($),
	}, function (args) {
		return {
			//#region lifecycle methods
			onInit: function () {
				this.onSubmitListeners = [];

				this.selectedSchool = null;
				this.selectedKlass = null;
				this.selectedStudent = null;
				this.studentModal = new args.bootstrap.Modal(args.jQuerySelector);
				this.studentModalForm = args.$('#studentModal_form');
				this.formElements = {
					title: $('#studentModal_title'),
					firstNameField: $('#studentModal_form_firstName'),
					lastNameField: $('#studentModal_form_lastName'),
					dateOfBirthField: $('#studentModal_form_dateOfBirth'),
					genderField: $('#studentModal_form_gender'),
					editIndex: $('#studentModal_form_editIndex'),
					submitBtn: $('#studentModal_form_submitBtn'),
				};

				// Submit a Student
				this.studentModalForm.on('submit', this.onSubmit.bind(this));

				// Remove the 'student' query param when the studentModal closes.
				args.$(args.jQuerySelector).on('hidden.bs.modal', () => {
					args.utils.removeQueryParam('student');
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
			//#endregion

			//#region UI Actions
			show: async function ({ school, klass, student, mode = 'create' }) {
				this.selectedSchool = school;
				this.selectedKlass = klass;
				this.selectedStudent = student;
				this.studentModalForm[0].reset();

				const { firstNameField, lastNameField, dateOfBirthField, genderField } = this.formElements;
				args.utils.resetValidation({ firstNameField, lastNameField, dateOfBirthField, genderField });

				switch (mode) {
					case 'edit':
						this.formElements.title.text('Modifier un élève');
						this.formElements.submitBtn.text('Modifier');
						this.formElements.firstNameField.val(student.firstName);
						this.formElements.lastNameField.val(student.lastName);
						this.formElements.dateOfBirthField.val(student.dateOfBirth);
						this.formElements.genderField.val(student.gender);
						break;
					case 'create':
					default:
						this.formElements.title.text('Ajouter un élève');
						this.formElements.submitBtn.text('Enregistrer');
						break;
				}

				this.studentModal.show();
			},
			hide: function () {
				this.studentModal.hide();
			},
			//#endregion

			//#region call listeners
			onSubmit: async function (e) {
				e.preventDefault();
				const { firstNameField, lastNameField, dateOfBirthField, genderField } = this.formElements;
				const isValid = args.utils.validateFields({ firstNameField, lastNameField, dateOfBirthField, genderField });
				if (!isValid) {
					return;
				}

				const studentData = {
					firstName: firstNameField.val(),
					lastName: lastNameField.val(),
					dateOfBirth: dateOfBirthField.val(),
					gender: genderField.val(),
				};
				if (Number(this.selectedStudent?.id) > 0) {
					studentData.id = Number(this.selectedStudent?.id);
				}

				this.onSubmitListeners.forEach((listener) => listener(studentData));
				this.studentModal.hide();
			},
			//#endregion
		};
	});
})();