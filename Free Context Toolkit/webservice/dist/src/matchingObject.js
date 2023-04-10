"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.matching = void 0;
exports.matching = [
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9tYXRjaGluZ09iamVjdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBYSxRQUFBLFFBQVEsR0FBRztJQUNwQjtRQUNJLElBQUksRUFBRSxZQUFZO1FBQ2xCLE9BQU8sRUFBRSxzRkFBc0Y7S0FDbEc7SUFDRDtRQUNJLElBQUksRUFBRSxZQUFZO1FBQ2xCLE9BQU8sRUFBRSxlQUFlO0tBQzNCO0lBQ0Q7UUFDSSxJQUFJLEVBQUUsVUFBVTtRQUNoQixPQUFPLEVBQUUsdUNBQXVDO0tBQ25EO0lBQ0Q7UUFDSSxJQUFJLEVBQUUsU0FBUztRQUNmLE9BQU8sRUFBRSx3QkFBd0I7S0FDcEM7SUFDRDtRQUNJLElBQUksRUFBRSxhQUFhO1FBQ25CLE9BQU8sRUFBRSx3RUFBd0U7S0FDcEY7SUFDRDtRQUNJLElBQUksRUFBRSxVQUFVO1FBQ2hCLE9BQU8sRUFBRSxtRUFBbUU7S0FDL0U7SUFDRDtRQUNJLElBQUksRUFBRSxxQkFBcUI7UUFDM0IsT0FBTyxFQUFFLDBCQUEwQjtLQUN0QztJQUNEO1FBQ0ksSUFBSSxFQUFFLGFBQWE7UUFDbkIsT0FBTyxFQUFFLHlFQUF5RTtLQUNyRjtJQUNEO1FBQ0ksSUFBSSxFQUFFLFdBQVc7UUFDakIsT0FBTyxFQUFFLCtMQUErTDtLQUMzTTtDQUNKLENBQUMiLCJmaWxlIjoic3JjL21hdGNoaW5nT2JqZWN0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNvbnN0IG1hdGNoaW5nID0gW1xuICAgIHtcbiAgICAgICAgbmFtZTogJ3Bob25lUmVnZXgnLFxuICAgICAgICBwYXR0ZXJuOiAvKFxcK1xcZHsxLDN9XFxzPyk/KFxcKFxcZHsxLDR9XFwpfFxcZHsxLDR9KVxccz9cXGR7MSw0fVtcXHMuLV0/XFxkezEsNH0oXFxzPyh4fGV4dClcXHM/XFxkezEsNH0pPy9nXG4gICAgfSxcbiAgICB7XG4gICAgICAgIG5hbWU6ICdlbWFpbFJlZ2V4JyxcbiAgICAgICAgcGF0dGVybjogL1xcdytAXFx3K1xcLlxcdysvZ1xuICAgIH0sXG4gICAge1xuICAgICAgICBuYW1lOiAndXJsUmVnZXgnLFxuICAgICAgICBwYXR0ZXJuOiAvKD86aHR0cHxodHRwcyk6XFwvXFwvW15cXHMvJC4/I10uW15cXHNdKi9nXG4gICAgfSxcbiAgICB7XG4gICAgICAgIG5hbWU6ICdpcFJlZ2V4JyxcbiAgICAgICAgcGF0dGVybjogLyhcXGR7MSwzfVxcLil7M31cXGR7MSwzfS9nXG4gICAgfSxcbiAgICB7XG4gICAgICAgIG5hbWU6ICdwZXJzb25SZWdleCcsXG4gICAgICAgIHBhdHRlcm46IC8oPzwhXFx3KShbQS1aXVthLXpBLVrDgC3DlsOYLcO2w7gtw79dKyg/OlxccytbQS1aXVthLXpBLVrDgC3DlsOYLcO2w7gtw79dKykrKSg/IVxcdykvZ1xuICAgIH0sXG4gICAge1xuICAgICAgICBuYW1lOiAndmluUmVnZXgnLFxuICAgICAgICBwYXR0ZXJuOiAvW0EtSEotTlBSLVphLWhqLW5wci16XFxkXXs4fVtcXGRYXVtBLUhKLU5QUi1aYS1oai1ucHItelxcZF17Mn1cXGR7Nn0vZ1xuICAgIH0sXG4gICAge1xuICAgICAgICBuYW1lOiAnc29jaWFsU2VjdXJpdHlSZWdleCcsXG4gICAgICAgIHBhdHRlcm46IC9cXGJcXGR7M30tP1xcZHsyfS0/XFxkezR9XFxiL2dcbiAgICB9LFxuICAgIHtcbiAgICAgICAgbmFtZTogJ2RvbWFpblJlZ2V4JyxcbiAgICAgICAgcGF0dGVybjogLyg/Omh0dHBzPzpcXC9cXC8pPyg/Ond3d1xcLik/KFthLXpBLVowLTktXSspXFwuKFthLXpBLVpdezIsNjN9KSg/OlxcL1xcUyopPy9naVxuICAgIH0sXG4gICAge1xuICAgICAgICBuYW1lOiAnaXB2NlJlZ2V4JyxcbiAgICAgICAgcGF0dGVybjogLyg/PCFbOi5cXHddKSg/Oig/OlthLWZBLUZcXGRdezEsNH06KXs3fVthLWZBLUZcXGRdezEsNH18KD89KD86W2EtZkEtRlxcZF17MCw0fTopezAsN31bYS1mQS1GXFxkXXswLDR9XFxiKSgoWzAtOWEtZkEtRl17MSw0fTopezAsNn1bMC05YS1mQS1GXXsxLDR9Ojo/KChbMC05YS1mQS1GXXsxLDR9Oil7MCw2fVswLTlhLWZBLUZdezEsNH0pPykpL2dcbiAgICB9XG5dOyJdfQ==
