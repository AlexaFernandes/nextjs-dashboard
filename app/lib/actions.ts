"use server"; //this marks all the exported functions within the file as Server Actions.
// These server functions can then be imported and used in Client and Server components. Any functions included in this file that are not used will be automatically removed from the final application bundle.

import { z } from "zod"; //zod is used to validate types and parse them also
import postgres from "postgres";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

//type of the object to verify, and validation error messages
const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: "Please select a customer.",
  }),
  //corce is to change the type to number (which is the expected behaviour here)
  amount: z.coerce
    .number()
    .gt(0, { message: "Please enter an amount greater than $0." }),
  status: z.enum(["pending", "paid"], {
    invalid_type_error: "Please select an invoice status.",
  }),
  date: z.string(),
});

//what will be verified
const CreateInvoice = FormSchema.omit({ id: true, date: true });

// Use Zod to update the expected types
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

export async function createInvoice(prevState: State, formData: FormData) {
  /*  const rawFormData = {
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  };

  // Test it out: (this log will appear in the vscode terminal not the browser's)
  console.log(rawFormData);
  console.log(typeof rawFormData.amount); */

  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });

  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Create Invoice.",
    };
  }

  // Prepare data for insertion into the database
  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split("T")[0];

  try {
    await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
  } catch (error) {
    // We'll also log the error to the console for now
    console.error(error);

    // If a database error occurs, return a more specific error.
    return {
      message: "Database Error: Failed to Create Invoice.",
    };
  }

  //Next.js has a client-side router cache that stores the route segments in the user's browser for a time. Along with prefetching, this cache ensures that users can quickly navigate between routes while reducing the number of requests made to the server.
  //Since you're updating the data displayed in the invoices route, you need to clear client-side router cache and trigger a new request to the server:
  revalidatePath("/dashboard/invoices");

  //finally redirect the user to the invoices page
  redirect("/dashboard/invoices");
}

export async function updateInvoice(
  id: string,
  prevState: State,
  formData: FormData,
) {
  const validatedFields = UpdateInvoice.safeParse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });

  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Update Invoice.",
    };
  }

  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;

  try {
    await sql`
    UPDATE invoices
    SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
    WHERE id = ${id}
    `;
  } catch (error) {
    // We'll also log the error to the console for now
    console.error(error);
    return {
      message: `Database Error: Failed to Update Invoice with id ${id}.`,
    };
  }

  // clear the client cache and make a new server request
  revalidatePath("/dashboard/invoices");

  redirect("/dashboard/invoices");
}

export async function deleteInvoice(id: string) {
  try {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
  } catch (error) {
    // We'll also log the error to the console for now
    console.error(error);
    return {
      message: `Database Error: Failed to Delete Invoice with id ${id}.`,
    };
  }
  revalidatePath("/dashboard/invoices");
}
