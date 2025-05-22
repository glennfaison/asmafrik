(() => {
	const noItemsRow = `<tr class="text-center text-muted" id="emptySchoolsRow"><td colspan="5">Liste vide</td></tr>`;

	registerUiModule('schools-page', {
		jQuerySelector: 'body',
		noItemsRow,
		$,
		schoolService: setUpServices().schoolService,
		utils: setUpUtils(),
	}, function (args) {
		return {
			//#region lifecycle methods
			onInit: async function () {
				this.schoolTableBody = args.$('#schoolTableBody');
				this.addSchoolBtn = args.$('#addSchoolBtn');
				this.schoolService = args.schoolService;

				await this.renderSchoolList();

				// Add a School
				this.addSchoolBtn.click(() => {
					args.utils.setQueryParams({ 'school': '' });
					this.onAddSchoolBtnClicked();
				});
				// Edit a School
				this.schoolTableBody.on('click', '.editBtn', async (e) => {
					const schoolId = $(e.target).data('id') || -1;
					args.utils.setQueryParams({ 'school': schoolId });
					const school = await this.schoolService.getSchoolById(schoolId);
					this.onEditSchoolBtnClicked(school);
				});
				// Delete a School
				this.schoolTableBody.on('click', '.deleteBtn', async (e) => {
					const schoolId = $(e.target).data('id') || -1;
					const school = await this.schoolService.getSchoolById(schoolId);
					this.onDeleteSchoolBtnClicked(school);
				});

				const query = args.utils.getQueryParams();
				if (query.hasOwnProperty('school') && query.school === undefined) {
					this.addSchoolBtn.click();
				} else if (query.hasOwnProperty('school') && !!query.school) {
					this.schoolTableBody.find(`.editBtn[data-id="${query.school}"`).click();
				}
			},
			onDestroy: function () {
				// Cleanup code here
			},
			//#endregion

			//#region UI Actions
			renderSchoolListRowAsString: function (school) {
				return `
				<tr data-id="${school.id}">
					<td>${school.name}</td>
					<td>${school.quarter}</td>
					<td>${school.dateCreated}</td>
					<td>
						<button type="button" class="btn btn-secondary btn-sm me-2 editBtn" data-id="${school.id}">Modifier</button>
						<button type="button" class="btn btn-danger btn-sm deleteBtn" data-id="${school.id}">Supprimer</button>
					</td>
				</tr>
			`;
			},
			renderSchoolList: async function () {
				const schools = await this.schoolService.listSchools();
				this.schoolTableBody.empty();

				if (schools.length === 0) {
					this.schoolTableBody.append(args.noItemsRow);
					return;
				}

				const rowsAsString = schools.map((school) => this.renderSchoolListRowAsString(school)).join('');
				this.schoolTableBody.append(rowsAsString);
			},
			insertRow: function (school) {
				const rowAsString = this.renderSchoolListRowAsString(school);
				const rows = this.schoolTableBody.find(`tr[data-id="${school.id}"]`);
				if (rows.length > 0) {
					rows.replaceWith(rowAsString);
				} else {
					// If no rows exist, remove the empty row message.
					this.schoolTableBody.find('#emptySchoolsRow').remove();
					this.schoolTableBody.append(rowAsString);
				}
			},
			removeRow: function (school) {
				this.schoolTableBody.find(`tr[data-id="${school.id}"]`).remove();
				if (this.schoolTableBody.find('tr').length === 0) {
					this.schoolTableBody.append(args.noItemsRow);
				}
			},
			addSchool: async function (school) {
				const _school = await this.schoolService.addSchool(school);
				this.insertRow(_school);
			},
			updateSchool: async function (school) {
				const _school = await this.schoolService.updateSchoolById(Number(school.id), school);
				this.insertRow(_school);
			},
			deleteSchool: async function (school) {
				this.removeRow(school);
			},
			//#endregion

			//#region call listeners
			onAddSchoolBtnClicked: function () {
				this.fireEvent('addSchoolBtnClicked');
			},
			onEditSchoolBtnClicked: function (school) {
				this.fireEvent('editSchoolBtnClicked', school);
			},
			onDeleteSchoolBtnClicked: function (school) {
				this.fireEvent('deleteSchoolBtnClicked', school);
			},
			//#endregion
		};
	});
})();