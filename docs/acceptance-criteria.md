# SprintDesk Lite: Acceptance Criteria

## 1. Create task

- **AC-1.1** Given the create form is empty, When I enter a valid title and submit, Then the task appears in the list with status `todo` and priority `medium`.
- **AC-1.2** Given I enter a title of 3 or 100 characters (after trimming), When I submit, Then the task is created.
- **AC-1.3** Given I enter a title of 2 or 101 characters, or only spaces, When I submit, Then the task is not created and an error is shown next to the Title field.
- **AC-1.4** Given I enter a description of more than 1000 characters, When I submit, Then the task is not created and an error is shown next to the Description field.
- **AC-1.5** Given I leave the description empty, When I submit, Then the task is created.
- **AC-1.6** Given a validation error is shown, When I focus the invalid field, Then a screen reader announces the error (linked with `aria-describedby`).
- **AC-1.7** Given the save fails, When the error appears, Then my typed input is kept and I can retry.
- **AC-1.8** Given a save is in progress, When I try to submit again, Then no second request is sent.
- **AC-1.9** Given I use only the keyboard, When I Tab through the form and press Enter, Then I can create a task.

## 2. Edit task

- **AC-2.1** Given a task exists, When I choose Edit, Then the form shows that task's current values.
- **AC-2.2** Given I change any field (title, description, priority, status) and save, Then the list shows the new values.
- **AC-2.3** Given I am editing and I choose Cancel, Then my changes are discarded and the task is unchanged.
- **AC-2.4** Given I enter invalid values, When I save, Then the same validation rules as AC-1.3 and AC-1.4 apply.
- **AC-2.5** Given the save fails, Then my input stays in the form and an error is shown.

## 3. Status

- **AC-3.1** Given a task is `todo`, When I move it to `in_progress`, Then it changes immediately.
- **AC-3.2** Given a task is `in_progress`, When I move it to `done`, Then it changes immediately.
- **AC-3.3** Given a task is `done`, When I move it to `in_progress`, Then it changes immediately.
- **AC-3.4** Given a task is `todo`, When I try to move it directly to `done`, Then I am asked to confirm, and the status changes only if I confirm.
- **AC-3.5** Given the confirmation is shown, When I cancel, Then the status stays `todo`.
- **AC-3.6** Given I change a status, Then the screen updates instantly (optimistic).
- **AC-3.7** Given a status change fails on the server, Then the status returns to its previous value and a message explains the failure.

## 4. Delete task

- **AC-4.1** Given a task exists, When I choose Delete, Then I am asked to confirm.
- **AC-4.2** Given the confirmation is shown, When I confirm, Then the task is removed and counts update.
- **AC-4.3** Given the confirmation is shown, When I cancel, Then the task stays.
- **AC-4.4** Given the delete fails, Then the task stays in the list and an error message is shown.
- **AC-4.5** Given I deleted a task, Then there is no way to undo it.

## 5. Search

- **AC-5.1** Given tasks exist, When I type in the search box, Then only tasks whose title or description contains the text are shown.
- **AC-5.2** Given I search `LOGIN`, Then tasks containing `login` in any letter case match.
- **AC-5.3** Given I type quickly, Then the list is updated once I pause typing (debounced), not on every key press.
- **AC-5.4** Given no task matches, Then the "No tasks match your filters" message is shown.

## 6. Filters

- **AC-6.1** Given I choose a status filter, Then only tasks with that status are shown.
- **AC-6.2** Given I choose a priority filter, Then only tasks with that priority are shown.
- **AC-6.3** Given search, status and priority are all set, Then a task must match all of them to be shown.
- **AC-6.4** Given filters are active, Then the page URL contains them (for example `?status=done&priority=high`).
- **AC-6.5** Given I open a URL with filters, Then the page shows the filtered view and the controls show the same values.
- **AC-6.6** Given the URL has an invalid value (for example `?status=banana`), Then it is ignored and no error occurs.

## 7. Sort

- **AC-7.1** Given I have not chosen a sort, Then tasks are sorted by created date, newest first.
- **AC-7.2** Given I choose sort by priority, Then high comes first, then medium, then low.
- **AC-7.3** Given I choose sort by created date, Then the newest task is first.
- **AC-7.4** Given sort and filters are both active, Then sorting applies to the filtered list.

## 8. Dashboard counts

- **AC-8.1** Given tasks exist, Then the board shows the number of tasks in `todo`, `in_progress` and `done`.
- **AC-8.2** Given tasks exist, Then the board shows the number of high-priority tasks that are not `done`.
- **AC-8.3** Given filters or search are active, Then all counts still reflect all tasks.
- **AC-8.4** Given I create, delete or change the status of a task, Then the counts update.

## 9. Empty states

- **AC-9.1** Given there are no tasks at all, Then the message "No tasks yet" is shown.
- **AC-9.2** Given tasks exist but none match the filters, Then "No tasks match your filters" is shown with a "Clear filters" button.
- **AC-9.3** Given I click "Clear filters", Then search, status and priority are reset (sort is kept) and all tasks are shown.

## 10. Persistence

- **AC-10.1** Given I create, edit or delete a task and refresh the page, Then the change is still there.
- **AC-10.2** Given all task changes go through the API layer, Then no component or hook writes task data to storage directly.

## Non-functional

- **AC-NF1 Accessibility.** Every control has a label. Validation errors are announced and linked to their input. Every action works by keyboard. Automated axe checks report no violations on the form and the page.
- **AC-NF2 Focus.** Given a confirmation dialog closes, Then focus returns to the control that opened it.
- **AC-NF3 Resilience.** Failed saves keep the user's input and offer a retry. A failed list load shows an error screen with a Retry button.
- **AC-NF4 Bad data.** Malformed tasks and duplicate ids from the server are skipped and do not crash the page.
- **AC-NF5 Performance.** With 500 tasks, changing one task's status does not re-render all rows.
- **AC-NF6 Quality.** At least 30 automated tests and 80% statement coverage of `src/features`.

## Out of scope

Multiple boards, user accounts, assignees, comments, attachments, drag and drop.

## Open questions

| #   | Question                                                                                                   | Assumption I made                                                                                                                                                                                                               |
| --- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | What happens to an open edit form if the task is deleted elsewhere?                                        | If the task is deleted from this page, the edit form closes immediately and the empty create form is shown. If it is deleted elsewhere (another tab or user), the same happens after the next list refetch. No message is shown |
| 2   | Does search match whole words or substrings?                                                               | Substrings, case-insensitive.                                                                                                                                                                                                   |
| 3   | Should "high priority not done" respect the current filters?                                               | No. Like the other counts, it covers all tasks.                                                                                                                                                                                 |
| 4   | Can a task move from `in_progress` back to `todo`?                                                         | Yes, without confirmation.                                                                                                                                                                                                      |
| 5   | Does the `todo` to `done` confirmation apply to every way of changing status (row dropdown and edit form)? | Yes.                                                                                                                                                                                                                            |                                                                                                                                                                                                                            |
| 6   | Does "Clear filters" also reset sort?                                                                      | No. It resets search, status and priority only.                                                                                                                                                                                 |
| 7   | How long is search debounced?                                                                              | 300 ms.                                                                                                                                                                                                                         |
| 8   | How is persistence done with the mock API?                                                                 | Components and hooks only use the API layer. The mock backend (`db.ts`) saves its data to `localStorage` so it survives a refresh. Tests use an in-memory seed.                                                                 |
| 9  | Is the description limit counted after trimming?                                                           | Yes, the same as the title.                                                                                                                                                                                                     |
| 10  | What if the delete confirmation is open and the task changes elsewhere?                                    | The dialog stays open and the delete applies to that task id. If the task is already gone, the server's 404 is shown as an error.                                                                                               |