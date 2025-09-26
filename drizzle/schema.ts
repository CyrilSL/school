import { pgTable, pgSequence } from "drizzle-orm/pg-core"
  import { sql } from "drizzle-orm"


export const postIdSeq = pgSequence("post_id_seq", {  startWith: "1", increment: "1", minValue: "1", maxValue: "2147483647", cache: "1", cycle: false })


