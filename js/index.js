$(document).ready(function () {
	const schoolPage = getUiModule('schools-page');
	const confirmDeletionDialog = getUiModule('confirm-deletion-dialog');
	const schoolFormDialog = getUiModule('school-form');
	const klassFormDialog = getUiModule('klass-form');
	const studentFormDialog = getUiModule('student-form');

	schoolPage.init();
	confirmDeletionDialog.init();
	schoolFormDialog.init();
	klassFormDialog.init();
	studentFormDialog.init();

	schoolPage.addEventListener('addSchoolBtnClicked', () => {
		schoolFormDialog.show({ mode: 'create' });
	});
	schoolPage.addEventListener('editSchoolBtnClicked', (school) => {
		schoolFormDialog.show({ mode: 'edit', school });
	});
	schoolPage.addEventListener('deleteSchoolBtnClicked', (school) => {
		confirmDeletionDialog.show({ item: school, itemType: 'school' });
	});
	schoolFormDialog.addEventListener('formSubmitted', (school) => {
		if (school.id > 0) {
			schoolPage.updateSchool(school);
		} else {
			schoolPage.addSchool(school);
		}
	});

	schoolFormDialog.addEventListener('addKlassBtnClicked', ({ school }) => {
		klassFormDialog.show({ mode: 'create', school });
	});
	schoolFormDialog.addEventListener('editKlassBtnClicked', ({ school, klass }) => {
		klassFormDialog.show({ mode: 'edit', school, klass });
	});
	schoolFormDialog.addEventListener('deleteKlassBtnClicked', ({ school, klass }) => {
		confirmDeletionDialog.show({ item: klass, itemType: 'klass' });
	});
	klassFormDialog.addEventListener('formSubmitted', (klass) => {
		if (klass.id > 0) {
			schoolFormDialog.updateKlass(klass);
		} else {
			schoolFormDialog.addKlass(klass);
		}
	});

	klassFormDialog.addEventListener('addStudentBtnClicked', ({ school, klass }) => {
		studentFormDialog.show({ mode: 'create', school, klass });
	});
	klassFormDialog.addEventListener('editStudentBtnClicked', ({ school, klass, student }) => {
		studentFormDialog.show({ mode: 'edit', school, klass, student });
	});
	klassFormDialog.addEventListener('deleteStudentBtnClicked', ({ school, klass, student }) => {
		confirmDeletionDialog.show({ item: student, itemType: 'student' });
	});
	studentFormDialog.addEventListener('formSubmitted', (student) => {
		if (student.id > 0) {
			klassFormDialog.updateStudent(student);
		} else {
			klassFormDialog.addStudent(student);
		}
	});

	confirmDeletionDialog.addEventListener('confirmBtnClicked', ({ item, itemType }) => {
		switch (itemType) {
			case 'school':
				schoolPage.deleteSchool(item);
				break;
			case 'klass':
				schoolFormDialog.deleteKlass(item);
				break;
			case 'student':
				klassFormDialog.deleteStudent(item);
				break;
			default:
				break;
		}
	});
});

