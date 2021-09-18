# Command Reference

List of possible command attributes and description:

Attribute | Required | Value | Description
--- | --- | --- | ---
`name` | Yes | `String` | The name of the command. This has to be entered for the command to be executed.
`description` | Yes | `String` | A description of the command.
`execute` | Yes | `Function` | The function that is executed when the command is executed. The function is passed the following parameters: `msg`, the message that was recieved and `args`, the arguments passed to the command if any.
`usage` | No | `String` | A usage string for the command. E.g. `<subcommand> <options/none>`.
`adminonly` | No | `Boolean` | If `true`, the command can only be executed by an admin. Default: `false`.
`hidden` | No | `Boolean` | If `true`, the command will not be shown in the help menu.	Default: `false`.
`args` | No | `Number` | Amount of arguments required for the command.
`aliases` | - | `Array<String>` | Not yet implemented.