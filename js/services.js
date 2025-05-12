function setUpServices() {
	let lastSchoolId = 5;
	let lastKlassId = 9;
	let lastStudentId = 5;

	const students = [
		{ firstName: 'Jean', lastName: 'Dupont', dateOfBirth: '2005-01-01', gender: 'Masculin', id: '1', },
		{ firstName: 'Marie', lastName: 'Martin', dateOfBirth: '2006-03-14', gender: 'Féminin', id: '2', },
		{ firstName: 'Pierre', lastName: 'Durand', dateOfBirth: '2005-05-20', gender: 'Masculin', id: '3', },
		{ firstName: 'Sophie', lastName: 'Petit', dateOfBirth: '2006-07-08', gender: 'Féminin', id: '4', },
		{ firstName: 'Luc', lastName: 'Bernard', dateOfBirth: '2005-09-15', gender: 'Masculin', id: '5', },
	];

	const schools = [
		{
			name: 'Lycée Bilingue de Yaoundé', quarter: 'Yaoundé', dateCreated: '2023-01-01', id: '1',
			klasses: [
				{ name: 'Mathématiques', program: 'T1', prof: 'M. Ngono', id: '1', students: JSON.parse(JSON.stringify(students)) },
				{ name: 'Physique', program: 'T2', prof: 'Mme Abena', id: '2', students: JSON.parse(JSON.stringify(students)) },
				{ name: 'Chimie', program: 'T3', prof: 'M. Tchana', id: '3', students: JSON.parse(JSON.stringify(students)) },
			]
		},
		{
			name: 'Lycée Technique de Douala', quarter: 'Douala', dateCreated: '2023-02-01', id: '2',
			klasses: [
				{ name: 'Biologie', program: 'T4', prof: 'Mme Ekane', id: '4', students: JSON.parse(JSON.stringify(students)) },
				{ name: 'Informatique', program: 'T5', prof: 'M. Fopa', id: '5', students: JSON.parse(JSON.stringify(students)) },
			]
		},
		{
			name: 'Lycée Classique de Bafoussam', quarter: 'Bafoussam', dateCreated: '2023-03-01', id: '3',
			klasses: [
				{ name: 'Mathématiques', program: 'T1', prof: 'M. Ngono', id: '6', students: JSON.parse(JSON.stringify(students)) },
				{ name: 'Physique', program: 'T2', prof: 'Mme Abena', id: '7', students: JSON.parse(JSON.stringify(students)) },
			]
		},
		{
			name: 'Lycée de Garoua', quarter: 'Garoua', dateCreated: '2023-04-01', id: '4',
			klasses: [],
		},
		{
			name: 'Lycée de Limbé', quarter: 'Limbé', dateCreated: '2023-05-01', id: '5',
			klasses: [
				{ name: 'Histoire & Géographie', program: 'T3', prof: 'M. Foncha', id: '8', students: JSON.parse(JSON.stringify(students)) },
				{ name: 'Anglais', program: 'T4', prof: 'Mme Ndoh', id: '9', students: JSON.parse(JSON.stringify(students)) },
			],
		},
	];

	const schoolService = {
		listSchools: async function () {
			return schools;
		},
		getSchoolById: async function (id) {
			return schools.find(school => school.id === `${id}`);
		},
		addSchool: async function (school) {
			school.id = `${lastSchoolId++}`;
			schools.push(school);
			return school;
		},
		updateSchoolById: async function (id, school) {
			const index = schools.findIndex(s => s.id === `${id}`);
			if (index === -1) {
				throw new Error('School not found');
			}
			schools[index] = { ...schools[index], ...school, id: `${id}` };
			return schools[index];
		},
		deleteSchoolById: async function (id) {
			const index = schools.findIndex(s => s.id === `${id}`);
			if (index === -1) {
				return;
			}
			schools.splice(index, 1);
		}
	};

	const klassService = {
		listKlassesBySchool: async function (schoolId) {
			const school = schools.find(school => school.id === `${schoolId}`);
			return school?.klasses || [];
		},
		getKlassById: async function (schoolId, klassId) {
			const school = schools.find(school => school.id === `${schoolId}`);
			if (!school) {
				return null;
			}
			const klass = school.klasses.find(klass => klass.id === `${klassId}`);
			return klass;
		},
		addKlassToSchool: async function (schoolId, klass) {
			const schoolIndex = schools.findIndex(school => school.id === `${schoolId}`);
			if (schoolIndex === -1) {
				throw new Error('School not found');
			}
			klass.id = `${lastKlassId++}`;
			schools[schoolIndex].klasses.push(klass);
			return klass;
		},
		updateKlassById: async function (schoolId, klassId, klass) {
			const schoolIndex = schools.findIndex(school => school.id === `${schoolId}`);
			if (schoolIndex === -1) {
				throw new Error('School not found');
			}
			const klassIndex = schools[schoolIndex].klasses.findIndex(klass => klass.id === `${klassId}`);
			if (klassIndex === -1) {
				throw new Error('Klass not found');
			}
			schools[schoolIndex].klasses[klassIndex] = { ...schools[schoolIndex].klasses[klassIndex], ...klass, id: `${klassId}` };
			return schools[schoolIndex].klasses[klassIndex];
		},
		deleteKlassById: async function (schoolId, klassId) {
			const schoolIndex = schools.findIndex(school => school.id === `${schoolId}`);
			if (schoolIndex === -1) {
				return;
			}
			const klasses = schools[schoolIndex].klasses;
			const klassIndex = klasses.findIndex(klass => klass.id === `${klassId}`);
			if (klassIndex === -1) {
				return;
			}
			klasses.splice(klassIndex, 1);
		}
	};

	const studentService = {
		listStudents: async function (schoolId, klassId) {
			const school = schools.find(school => school.id === `${schoolId}`);
			if (!school) {
				return [];
			}
			const klass = school.klasses.find(klass => klass.id === `${klassId}`);
			if (!klass) {
				return [];
			}
			return klass.students;
		},
		getStudentById: async function (schoolId, klassId, studentId) {
			const school = schools.find(school => school.id === `${schoolId}`);
			if (!school) {
				return null;
			}
			const klass = school.klasses.find(klass => klass.id === `${klassId}`);
			if (!klass) {
				return null;
			}
			return klass.students.find(student => student.id === `${studentId}`);
		},
		addStudent: async function (schoolId, klassId, student) {
			const schoolIndex = schools.findIndex(school => school.id === `${schoolId}`);
			if (schoolIndex === -1) {
				throw new Error('School not found');
			}
			const klassIndex = schools[schoolIndex].klasses.findIndex(klass => klass.id === `${klassId}`);
			if (klassIndex === -1) {
				throw new Error('Klass not found');
			}
			const klass = schools[schoolIndex].klasses[klassIndex];
			student.id = `${lastStudentId++}`;
			klass.students.push(student);
			return student;
		},
		updateStudent: async function (schoolId, klassId, studentId, student) {
			const schoolIndex = schools.findIndex(school => school.id === `${schoolId}`);
			if (schoolIndex === -1) {
				throw new Error('School not found');
			}
			const klassIndex = schools[schoolIndex].klasses.findIndex(klass => klass.id === `${klassId}`);
			if (klassIndex === -1) {
				throw new Error('Klass not found');
			}
			const klass = schools[schoolIndex].klasses[klassIndex];
			const studentIndex = klass.students.findIndex(s => s.id === `${studentId}`);
			if (studentIndex === -1) {
				throw new Error('Student not found');
			}
			klass.students[studentIndex] = { ...klass.students[studentIndex], ...student, id: `${studentId}` };
			return klass.students[studentIndex];
		},
		deleteStudent: async function (schoolId, klassId, studentId) {
			const schoolIndex = schools.findIndex(school => school.id === `${schoolId}`);
			if (schoolIndex === -1) {
				return;
			}
			const klassIndex = schools[schoolIndex].klasses.findIndex(klass => klass.id === `${klassId}`);
			if (klassIndex === -1) {
				return;
			}
			const klass = schools[schoolIndex].klasses[klassIndex];
			const studentIndex = klass.students.findIndex(s => s.id === `${studentId}`);
			if (studentIndex === -1) {
				return;
			}
			klass.students.splice(studentIndex, 1);
		}
	};

	return {
		schoolService,
		klassService,
		studentService
	};
};
