const chalk = require(`chalk`)

const { didYouMean } = require(`../../utils/did-you-mean`)
const { gatsbyConfigSchema } = require(`../../joi-schemas/joi`)

module.exports = (state = {}, action) => {
  switch (action.type) {
    case `SET_SITE_CONFIG`: {
      // Validate the config.
      const result = gatsbyConfigSchema.validate(action.payload || {})

      const normalizedPayload = result.value

      // TODO use Redux for capturing errors from different
      // parts of Gatsby so a) can capture richer errors and b) be
      // more flexible how to display them.
      if (result.error) {
        console.log(
          chalk.blue.bgYellow(`The site's gatsby-config.js failed validation`)
        )

        // Display a 'did you mean' suggestion to resolve config error.
        const invalidConfig = result.error.details.filter(
          details => details.type === `object.allowUnknown`
        )

        if (Array.isArray(invalidConfig) && invalidConfig.length) {
          invalidConfig.map(config => {
            const { key } = config.context
            const suggestion = didYouMean(key)

            console.log(chalk.bold.red(`${key} is not allowed. ${suggestion}`))
          })
        } else {
          console.log(chalk.bold.red(result.error))
        }

        if (normalizedPayload.linkPrefix) {
          console.log(`"linkPrefix" should be changed to "pathPrefix"`)
        }
        throw new Error(`The site's gatsby-config.js failed validation`)
      }

      return normalizedPayload
    }
    default:
      return state
  }
}
