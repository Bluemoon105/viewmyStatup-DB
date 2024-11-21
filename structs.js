import * as s from "superstruct";

export const CreateInvest = s.object({
    name: s.string(),
    investAmount: s.bigint(),
    comment : s.string(),
    password : s.string(),
    startupId: s.number(),
});

export const PatchCount = s.object({
    count: s.number(),
});

export const PatchInvest = s.partial(CreateInvest);