export const matching = [
    {
        name: 'phoneRegex',
        pattern: /(\+\d{1,3}\s?)?(\(\d{1,4}\)|\d{1,4})\s?\d{1,4}[\s.-]?\d{1,4}(\s?(x|ext)\s?\d{1,4})?/g
    },
    {
        name: 'emailRegex',
        pattern: /\w+@\w+\.\w+/g
    },
    {
        name: 'urlRegex',
        pattern: /(?:http|https):\/\/[^\s/$.?#].[^\s]*/g
    },
    {
        name: 'ipRegex',
        pattern: /(\d{1,3}\.){3}\d{1,3}/g
    },
    {
        name: 'personRegex',
        pattern: /(?<!\w)([A-Z][a-zA-ZÀ-ÖØ-öø-ÿ]+(?:\s+[A-Z][a-zA-ZÀ-ÖØ-öø-ÿ]+)+)(?!\w)/g
    },
    {
        name: 'vinRegex',
        pattern: /[A-HJ-NPR-Za-hj-npr-z\d]{8}[\dX][A-HJ-NPR-Za-hj-npr-z\d]{2}\d{6}/g
    },
    {
        name: 'socialSecurityRegex',
        pattern: /\b\d{3}-?\d{2}-?\d{4}\b/g
    },
    {
        name: 'domainRegex',
        pattern: /(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+)\.([a-zA-Z]{2,63})(?:\/\S*)?/gi
    },
    {
        name: 'ipv6Regex',
        pattern: /(?<![:.\w])(?:(?:[a-fA-F\d]{1,4}:){7}[a-fA-F\d]{1,4}|(?=(?:[a-fA-F\d]{0,4}:){0,7}[a-fA-F\d]{0,4}\b)(([0-9a-fA-F]{1,4}:){0,6}[0-9a-fA-F]{1,4}::?(([0-9a-fA-F]{1,4}:){0,6}[0-9a-fA-F]{1,4})?))/g
    }
];