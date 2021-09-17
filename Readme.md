# WarpCamp 2021 Prisma demo

Demonstrates [Prisma.io](https://www.prisma.io/) in action. Sample project - migration script from BigTable to PosgreSQL.

Contains [`fakeData()`](./src/fakeData.ts) so example is runnable also w/o BigTable.

## Requirements

- Node.js v14+
- `yarn` 1 installed globally


## Installation

- `yarn install`
- copy `.env [example]` into `.env`, change required values
- migrate the DB `yarn prisma migrate dev`
- run the script `yarn start`

## DB schema

![](https://i.postimg.cc/mkLM4QDL/Screenshot-2021-09-17-at-15-09-27.png)
