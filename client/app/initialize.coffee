app = require 'application'

# The function called from index.html
$ ->
    $.fn.spin = (opts, color) ->
        presets =
            tiny:
                lines: 8
                length: 2
                width: 2
                radius: 3

            small:
                lines: 8
                length: 1
                width: 2
                radius: 4

            medium:
                lines: 10
                length: 4
                width: 3
                radius: 6

            large:
                lines: 10
                length: 8
                width: 4
                radius: 8

            extralarge:
                lines: 8
                length: 3
                width: 10
                radius: 20
                top: 30
                left: 50

        if Spinner?
            @each ->
                $this = $(this)
                spinner = $this.data("spinner")
                if spinner?
                    spinner.stop()
                    $this.data "spinner", null
                else if opts isnt false
                    if typeof opts is "string"
                        if opts of presets
                            opts = presets[opts]
                        else
                            opts = {}
                        if color then opts.color = color

                    spinner = new Spinner opts
                    spinner.spin(this)
                    $this.data "spinner", spinner

    app.initialize()