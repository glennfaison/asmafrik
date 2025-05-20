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

	schoolPage.addAddSchoolBtnClickedListener(() => {
		schoolFormDialog.show({ mode: 'create' });
	});
	schoolPage.addEditSchoolBtnClickedListener((school) => {
		schoolFormDialog.show({ mode: 'edit', school });
	});
	schoolPage.addDeleteSchoolBtnClickedListener((school) => {
		confirmDeletionDialog.show({ item: school, itemType: 'school' });
	});
	schoolFormDialog.addSubmitListener((school) => {
		if (school.id > 0) {
			schoolPage.updateSchool(school);
		} else {
			schoolPage.addSchool(school);
		}
	});

	schoolFormDialog.addAddKlassBtnClickedListener(({ school }) => {
		klassFormDialog.show({ mode: 'create', school });
	});
	schoolFormDialog.addEditKlassBtnClickedListener(({ school, klass }) => {
		klassFormDialog.show({ mode: 'edit', school, klass });
	});
	schoolFormDialog.addDeleteKlassBtnClickedListener(({ school, klass }) => {
		confirmDeletionDialog.show({ item: klass, itemType: 'klass' });
	});
	klassFormDialog.addSubmitListener((klass) => {
		if (klass.id > 0) {
			schoolFormDialog.updateKlass(klass);
		} else {
			schoolFormDialog.addKlass(klass);
		}
	});

	klassFormDialog.addAddStudentBtnClickedListener(({ school, klass }) => {
		studentFormDialog.show({ mode: 'create', school, klass });
	});
	klassFormDialog.addEditStudentBtnClickedListener(({ school, klass, student }) => {
		studentFormDialog.show({ mode: 'edit', school, klass, student });
	});
	klassFormDialog.addDeleteStudentBtnClickedListener(({ school, klass, student }) => {
		confirmDeletionDialog.show({ item: student, itemType: 'student' });
	});
	studentFormDialog.addSubmitListener((student) => {
		if (student.id > 0) {
			klassFormDialog.updateStudent(student);
		} else {
			klassFormDialog.addStudent(student);
		}
	});

	confirmDeletionDialog.addConfirmListener(({ item, itemType }) => {
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

