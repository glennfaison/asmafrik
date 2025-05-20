function setUpUtils($) {
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
		validateFields,
		resetValidation,
	};
}
