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

	function getQueryParams(param) {
		const parts = globalThis.location.search.substring(1).split('&');
		const entries = parts.map((part) => part.split('='));
		const queryParams = Object.fromEntries(entries);
		return param ? queryParams[param] : queryParams;
	}

	function setQueryParams(obj) {
		const merged = { ...getQueryParams(), ...obj };
		let str = '';
		for (let key in merged) {
			if (!key) { continue; }
			str += `&${key}=${merged[key]}`
		}
		const url = new URL(globalThis.location);
		url.search = str.substring(1);
		history.pushState(null, '', url.toString());
	}

	function removeQueryParam(param) {
		const parts = globalThis.location.search.substring(1).split('&')
			.filter((part) => part !== param && !part.startsWith(`${param}=`));
		const url = new URL(globalThis.location);
		url.search = parts.join('&');
		history.pushState(null, '', url.toString());
	}

	return {
		validateFields,
		resetValidation,
		getQueryParams,
		setQueryParams,
		removeQueryParam,
	};
}
