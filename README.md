
# NlabsGrid

NlabsGrid is a customizable Angular data grid library designed for enterprise applications. It provides flexible data adapters, advanced templating, and theming support.

## Features

- Highly customizable data grid component
- Support for REST, OData, and mock data adapters
- Column, header, footer, and cell templating
- Built-in theme selector and theme service
- Easy integration with Angular projects

## Installation

Install the library using npm:

```bash
npm install nlabs-grid
```

## Usage

Import the `NlabsGrid` module and use the `<nlabs-data-grid>` component in your Angular application:

```typescript
import { DataGridComponent } from 'nlabs-grid';
```

Example usage in a template:

```html
<nlabs-data-grid [config]="gridConfig" [adapter]="dataAdapter"></nlabs-data-grid>
```

## Building the Library

To build the library, run:

```bash
ng build nlabs-grid
```

The build artifacts will be stored in the `dist/nlabs-grid/` directory.

## Publishing the Library

To publish the library to npm:

```bash
cd dist/nlabs-grid
npm publish
```

## Running Unit Tests

To execute unit tests:

```bash
ng test nlabs-grid
```

## API Reference

See the [public-api.ts](./projects/nlabs-grid/src/public-api.ts) file for all exported modules, components, directives, and services.

## Example Components

- `DataGridComponent`: Main grid component
- `GridColumnComponent`: Column definition
- `ThemeSelectorComponent`: Theme switcher

## Development

Clone the repository and install dependencies:

```bash
git clone https://github.com/NlabsNpmPackages/nlabs-grid.git
cd nlabs-grid
npm install
```

## License

MIT
