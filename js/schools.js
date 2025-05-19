$(document).ready(function () {
	const { schoolService, klassService, studentService, } = setUpServices();
	const {
		getSchoolListRowAsString,
		getKlassListRowAsString,
		getStudentListRowAsString,
		validateFields,
		resetValidation
	} = setUpUtils($);

	const noItemsRow = `<tr class="text-center text-muted" id="emptySchoolsRow"><td colspan="5">Liste vide</td></tr>`;
	let selectedSchoolId = -1;
	let selectedKlassId = -1;
	let selectedStudentId = -1;
	let deleteModalText = '';

	const schoolTableBody = $('#schoolTableBody');
	const schoolModal = new bootstrap.Modal('#schoolModal');
	const klassTableBody = $('#klassTableBody');
	const klassModal = new bootstrap.Modal('#klassModal');
	const studentTableBody = $('#studentTableBody');
	const studentModal = new bootstrap.Modal('#studentModal');
	const deleteModal = new bootstrap.Modal('#deleteConfirmModal');

	const schoolModalElements = {
		title: $('#schoolModal_title'),
		nameField: $('#schoolModal_form_name'),
		quarterField: $('#schoolModal_form_quarter'),
		dateField: $('#schoolModal_form_date'),
		editIndex: $('#schoolModal_form_editIndex'),
		addKlassBtn: $('#schoolModal_addKlassBtn'),
		submitBtn: $('#schoolModal_form_submitBtn'),
	};

	const klassModalElements = {
		title: $('#klassModal_title'),
		nameField: $('#klassModal_form_name'),
		programField: $('#klassModal_form_program'),
		profField: $('#klassModal_form_prof'),
		editIndex: $('#klassModal_form_editIndex'),
		submitBtn: $('#klassModal_form_submitBtn'),
		addStudentBtn: $('#klassModal_addStudentBtn'),
	};

	const studentModalElements = {
		title: $('#studentModal_title'),
		firstNameField: $('#studentModal_form_firstName'),
		lastNameField: $('#studentModal_form_lastName'),
		dateOfBirthField: $('#studentModal_form_dateOfBirth'),
		genderField: $('#studentModal_form_gender'),
		editIndex: $('#studentModal_form_editIndex'),
		submitBtn: $('#studentModal_form_submitBtn'),
	};

	async function renderSchoolList() {
		const schools = await schoolService.listSchools();
		schoolTableBody.empty();

		if (schools.length === 0) {
			schoolTableBody.append(noItemsRow);
			return;
		}

		const rowsAsString = schools.map((school) => getSchoolListRowAsString({ school })).join('');
		schoolTableBody.append(rowsAsString);
	}

	async function renderKlassList(schoolId) {
		const klasses = await klassService.listKlassesBySchool(schoolId);
		klassTableBody.empty();

		if (klasses.length === 0) {
			klassTableBody.append(noItemsRow);
			return;
		}

		const rowsAsString = klasses.map((klass) => getKlassListRowAsString({ klass })).join('');
		klassTableBody.append(rowsAsString);
	}

	async function renderStudentList(schoolId, klassId) {
		const students = await studentService.listStudents(schoolId, klassId);
		studentTableBody.empty();

		if (students.length === 0) {
			studentTableBody.append(noItemsRow);
			return;
		}

		const rowsAsString = students.map((student) => getStudentListRowAsString({ student })).join('');
		studentTableBody.append(rowsAsString);
	}

	function removeRowFromTable(tableBodyElement, selectedSchoolId) {
		tableBodyElement.find(`tr[data-id="${selectedSchoolId}"]`).remove();
		if (tableBodyElement.find('tr').length === 0) {
			tableBodyElement.append(noItemsRow);
		}
	}

	function insertRowToTable(tableBodyElement, rowAsString, index) {
		if (Number(index) > 0) {
			tableBodyElement.find(`tr[data-id="${index}"]`).replaceWith(rowAsString);
		} else {
			// If no rows exist, remove the empty row message.
			tableBodyElement.find('#emptySchoolsRow').remove();
			tableBodyElement.append(rowAsString);
		}
	}

	async function renderSchoolForm({ mode = 'view', schoolId }) {
		selectedStudentId = -1;
		selectedKlassId = -1;
		$('#schoolModal_form')[0].reset();
		const { nameField, quarterField, dateField } = schoolModalElements;
		resetValidation({ nameField, quarterField, dateField });
		if (mode === 'edit') {
			selectedSchoolId = schoolId;
			const s = await schoolService.getSchoolById(selectedSchoolId);
			schoolModalElements.title.text('Modifier un établissement');
			schoolModalElements.submitBtn.text('Modifier');
			schoolModalElements.nameField.val(s.name);
			schoolModalElements.quarterField.val(s.quarter);
			schoolModalElements.dateField.val(s.dateCreated);
			schoolModalElements.addKlassBtn.removeClass('disabled');
			schoolModalElements.addKlassBtn.prop('disabled', false);
		} else {
			selectedSchoolId = -1;
			schoolModalElements.title.text('Ajouter un établissement');
			schoolModalElements.submitBtn.text('Enregistrer');
			schoolModalElements.addKlassBtn.addClass('disabled');
			schoolModalElements.addKlassBtn.prop('disabled', true);
		}

		renderKlassList(schoolId);
		schoolModal.show();
	}

	async function renderKlassForm({ mode = 'view', klassId }) {
		selectedStudentId = -1;
		$('#klassModal_form')[0].reset();
		const { nameField, programField, profField } = klassModalElements;
		resetValidation({ nameField, programField, profField });
		if (mode === 'edit') {
			selectedKlassId = klassId;
			const k = await klassService.getKlassById(selectedSchoolId, selectedKlassId);
			klassModalElements.title.text('Modifier une classe');
			klassModalElements.submitBtn.text('Modifier');
			klassModalElements.nameField.val(k.name);
			klassModalElements.programField.val(k.program);
			klassModalElements.profField.val(k.prof);
			klassModalElements.addStudentBtn.removeClass('disabled');
			klassModalElements.addStudentBtn.prop('disabled', false);
		} else {
			selectedKlassId = -1
			klassModalElements.title.text('Ajouter une classe');
			klassModalElements.submitBtn.text('Enregistrer');
			klassModalElements.addStudentBtn.addClass('disabled');
			klassModalElements.addStudentBtn.prop('disabled', true);
		}

		renderStudentList(selectedSchoolId, selectedKlassId);
		klassModal.show();
	}

	async function renderStudentForm({ mode = 'view', studentId }) {
		$('#studentModal_form')[0].reset();
		const { firstNameField, lastNameField, dateOfBirthField, genderField } = studentModalElements;
		resetValidation({ firstNameField, lastNameField, dateOfBirthField, genderField });
		if (mode === 'edit') {
			selectedStudentId = studentId;
			const s = await studentService.getStudentById(selectedSchoolId, selectedKlassId, selectedStudentId);
			studentModalElements.title.text('Modifier un élève');
			studentModalElements.submitBtn.text('Modifier');
			studentModalElements.firstNameField.val(s.firstName);
			studentModalElements.lastNameField.val(s.lastName);
			studentModalElements.dateOfBirthField.val(s.dateOfBirth);
			studentModalElements.genderField.val(s.gender);
		}
		else {
			selectedStudentId = -1;
			studentModalElements.title.text('Ajouter un élève');
			studentModalElements.submitBtn.text('Enregistrer');
		}
		studentModal.show();
	}

	renderSchoolList(); // Initial render

	// #region School CRUD
	// Add a School
	$('#addSchoolBtn').click(() => renderSchoolForm({ mode: 'view' }));

	// Edit a School
	schoolTableBody.on('click', '.editBtn', (e) => renderSchoolForm({ mode: 'edit', schoolId: $(e.target).data('id') }));

	// Submit details for a School form
	$('#schoolModal_form').submit(async function onSubmitschoolModal_form(e) {
		e.preventDefault();
		const { nameField, quarterField, dateField } = schoolModalElements;
		const isValid = validateFields({ nameField, quarterField, dateField });
		if (!isValid) {
			return;
		}

		const schoolData = { name: nameField.val(), quarter: quarterField.val(), dateCreated: dateField.val() };
		if (Number(selectedSchoolId) > 0) {
			const school = await schoolService.updateSchoolById(Number(selectedSchoolId), schoolData);
			schoolData.id = school.id;
		} else {
			const school = await schoolService.addSchool(schoolData);
			schoolData.id = school.id;
		}

		const rowAsString = getSchoolListRowAsString({ school: schoolData });
		insertRowToTable(schoolTableBody, rowAsString, selectedSchoolId);
		schoolModal.hide();
	});

	// Delete a School
	schoolTableBody.on('click', '.deleteBtn', async function () {
		selectedStudentId = -1;
		selectedKlassId = -1;
		selectedSchoolId = Number($(this).data('id')) || -1;
		deleteModalText = `Nom de l'établissement: ${$(this).closest('tr').find('td').eq(0).text()}`;
		$(deleteModal._element).find('.modal-body').text(deleteModalText);
		deleteModal.show();
	});
	// #endregion

	// #region Klass CRUD
	// Add a Klass
	schoolModalElements.addKlassBtn.click(() => renderKlassForm({ mode: 'view' }));

	// Edit a Klass
	klassTableBody.on('click', '.editBtn', (e) => renderKlassForm({ mode: 'edit', klassId: $(e.target).data('id') }));

	// Submit details for a Klass form
	$('#klassModal_form').submit(async function onSubmitKlassModal_form(e) {
		e.preventDefault();
		const { nameField, programField, profField } = klassModalElements;
		const isValid = validateFields({ nameField, programField, profField });
		if (!isValid) {
			return;
		}
		const klassData = { name: nameField.val(), program: programField.val(), prof: profField.val() };

		if (Number(selectedKlassId) > 0) {
			const klass = await klassService.updateKlassById(selectedSchoolId, Number(selectedKlassId), klassData);
			klassData.id = klass.id;
		} else {
			const klass = await klassService.addKlassToSchool(selectedSchoolId, klassData);
			klassData.id = klass.id;
		}
		const rowAsString = getKlassListRowAsString({ klass: klassData });
		insertRowToTable(klassTableBody, rowAsString, selectedKlassId);
		klassModal.hide();
	});

	// Delete a Klass
	klassTableBody.on('click', '.deleteBtn', function () {
		selectedStudentId = -1;
		selectedKlassId = Number($(this).data('id'));
		deleteModalText = `Nom de la classe: ${$(this).closest('tr').find('td').eq(0).text()}`;
		$(deleteModal._element).find('.modal-body').text(deleteModalText);
		deleteModal.show();
	});
	// #endregion

	// #region Student CRUD
	// Add a Student
	klassModalElements.addStudentBtn.click(() => renderStudentForm({ mode: 'view' }));

	// Edit a Student
	studentTableBody.on('click', '.editBtn', (e) => renderStudentForm({ mode: 'edit', studentId: $(e.target).data('id') }));

	// Submit details for a Student form
	$('#studentModal_form').submit(async function onSubmitStudentModal_form(e) {
		e.preventDefault();
		const { firstNameField, lastNameField, dateOfBirthField, genderField } = studentModalElements;
		const isValid = validateFields({ firstNameField, lastNameField, dateOfBirthField, genderField });
		if (!isValid) {
			return;
		}
		const studentData = {
			firstName: firstNameField.val(),
			lastName: lastNameField.val(),
			dateOfBirth: dateOfBirthField.val(),
			gender: genderField.val(),
		};
		if (Number(selectedStudentId) > 0) {
			const student = await studentService.updateStudent(selectedSchoolId, selectedKlassId, Number(selectedStudentId), studentData);
			studentData.id = student.id;
		} else {
			const student = await studentService.addStudent(selectedSchoolId, selectedKlassId, studentData);
			studentData.id = student.id;
		}
		const rowAsString = getStudentListRowAsString({ student: studentData });
		insertRowToTable(studentTableBody, rowAsString, selectedStudentId);
		studentModal.hide();
	});

	// Delete a Student
	studentTableBody.on('click', '.deleteBtn', function () {
		selectedStudentId = Number($(this).data('id'));
		deleteModalText = `Nom de l'élève: ${$(this).closest('tr').find('td').eq(0).text()}`;
		$(deleteModal._element).find('.modal-body').text(deleteModalText);
		deleteModal.show();
	});
	// #endregion

	// Confirm delete action
	$('#confirmDeleteBtn').click(async function onDeleteSchoolClick() {
		switch (true) {
			case Number(selectedStudentId) > 0:
				await studentService.deleteStudent(selectedSchoolId, selectedKlassId, selectedStudentId);
				removeRowFromTable(studentTableBody, selectedStudentId);
				break;
			case Number(selectedKlassId) > 0:
				await klassService.deleteKlassById(selectedSchoolId, selectedKlassId);
				removeRowFromTable(klassTableBody, selectedKlassId);
				break;
			case Number(selectedSchoolId) > 0:
				await schoolService.deleteSchoolById(selectedSchoolId);
				removeRowFromTable(schoolTableBody, selectedSchoolId, noItemsRow);
				break;
			default:
				break;
		}
		deleteModal.hide();
	});
});

