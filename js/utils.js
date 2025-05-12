function setUpUtils($) {
	function getSchoolListRowAsString({ school }) {
		return (`
		<tr data-id="${school.id}">
			<td>${school.name}</td>
			<td>${school.quarter}</td>
			<td>${school.dateCreated}</td>
			<td>
				<button type="button" class="btn btn-secondary btn-sm me-2 editBtn" data-id="${school.id}">Modifier</button>
				<button type="button" class="btn btn-danger btn-sm deleteBtn" data-id="${school.id}">Supprimer</button>
			</td>
		</tr>
	`);
	}

	function getKlassListRowAsString({ klass }) {
		return (`
		<tr data-id="${klass.id}">
			<td>${klass.name}</td>
			<td>${klass.program}</td>
			<td>${klass.prof}</td>
			<td>
				<button type="button" class="btn btn-secondary btn-sm me-2 editBtn" data-id="${klass.id}">Modifier</button>
				<button type="button" class="btn btn-danger btn-sm deleteBtn" data-id="${klass.id}">Supprimer</button>
			</td>
		</tr>
	`);
	}

	function getStudentListRowAsString({ student }) {
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
	}

	function validateFields(fields) {
		let isValid = true;
		for (const field in fields) {
			const $field = $(fields[field]);
			const value = $field.val();
			if (!value) {
				$field.siblings('small').removeClass('d-none').addClass('d-block');
				isValid = false;
			} else {
				$field.siblings('small').removeClass('d-block').addClass('d-none');
			}
		}
		return isValid;
	}

	function resetValidation(fields) {
		for (const field in fields) {
			$(fields[field]).siblings('small').removeClass('d-block').addClass('d-none');
		}
	}

	return {
		getSchoolListRowAsString,
		getKlassListRowAsString,
		getStudentListRowAsString,
		validateFields,
		resetValidation,
	};
}
