import { useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import FormField from './FormField';
import ServerIssueAlert from './ServerIssueAlert';
import {
  buildEmployeeSchema,
  EMPLOYEE_FORM_FIELDS,
  type EmployeeFormValues,
} from '../../schemas/employeeSchema';
import type { EmployeeCatalogs } from '../../types/catalog';
import type { CreateEmployeePayload, Employee, UpdateEmployeePayload } from '../../types/employee';
import { EMPTY_FORM_VALUES, employeeToFormValues, toCreatePayload, toUpdatePayload } from '../../utils/employeePayload';
import { resolveServerIssue, type ServerIssue } from '../../utils/formErrors';

type EmployeeFormProps = {
  catalogs: EmployeeCatalogs;
  cancelTo: string;
} & (
  | { mode: 'create'; employee?: undefined; onSubmit: (payload: CreateEmployeePayload) => Promise<void> }
  | { mode: 'edit'; employee: Employee; onSubmit: (payload: UpdateEmployeePayload) => Promise<void> }
);

interface Option {
  id: string;
  name: string;
}

const UNAVAILABLE = ' (ya no disponible)';

function Fieldset({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="rounded-xl border border-slate-200 bg-white p-5">
      <legend className="px-1 text-base font-semibold text-slate-900">{title}</legend>
      <div className="mt-2 grid gap-4 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

function EmployeeForm(props: EmployeeFormProps) {
  const { catalogs, cancelTo, mode, employee } = props;
  const [issue, setIssue] = useState<ServerIssue | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const schema = useMemo(
    () => buildEmployeeSchema(catalogs, employee ? employeeToFormValues(employee) : undefined),
    [catalogs, employee],
  );

  const {
    register,
    handleSubmit,
    control,
    getValues,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(schema),
    defaultValues: employee ? employeeToFormValues(employee) : EMPTY_FORM_VALUES,
    mode: 'onTouched',
  });

  const departmentId = useWatch({ control, name: 'departmentId' });

  const departmentOptions = useMemo<Option[]>(() => {
    const options = catalogs.departments.map((item) => ({ id: item.id, name: item.name }));
    if (employee && !options.some((item) => item.id === employee.department.id)) {
      options.unshift({ id: employee.department.id, name: employee.department.name + UNAVAILABLE });
    }
    return options;
  }, [catalogs, employee]);

  const positionOptions = useMemo<Option[]>(() => {
    const options = catalogs.positions
      .filter((item) => departmentId !== '' && item.departmentIds.includes(departmentId))
      .map((item) => ({ id: item.id, name: item.name }));
    if (employee && departmentId === employee.department.id && !options.some((item) => item.id === employee.position.id)) {
      options.unshift({ id: employee.position.id, name: employee.position.name + UNAVAILABLE });
    }
    return options;
  }, [catalogs, employee, departmentId]);

  const showServerError = (error: unknown) => {
    setIssue(
      resolveServerIssue(error, EMPLOYEE_FORM_FIELDS, (field, message, focus) =>
        setError(field, { type: 'server', message }, { shouldFocus: focus }),
      ),
    );
  };

  const submit = handleSubmit(async (values) => {
    setIssue(null);
    setInfo(null);
    try {
      if (props.mode === 'create') {
        await props.onSubmit(toCreatePayload(values));
        return;
      }
      const payload = toUpdatePayload(values, props.employee);
      if (Object.keys(payload).length === 0) {
        setInfo('No hay cambios para guardar.');
        return;
      }
      await props.onSubmit(payload);
    } catch (error) {
      showServerError(error);
    }
  });

  const saveLabel = mode === 'create' ? 'Registrar empleado' : 'Guardar cambios';

  return (
    <form onSubmit={submit} noValidate autoComplete="off" className="space-y-6">
      <p className="text-sm text-slate-600">
        Los campos marcados con <span aria-hidden="true">*</span>
        <span className="sr-only">asterisco</span> son obligatorios.
      </p>

      <Fieldset title="Datos personales">
        <FormField id="emp-firstName" label="Primer nombre" required error={errors.firstName?.message}>
          {(control) => <input type="text" {...control} {...register('firstName')} />}
        </FormField>
        <FormField id="emp-middleName" label="Segundo nombre" error={errors.middleName?.message}>
          {(control) => <input type="text" {...control} {...register('middleName')} />}
        </FormField>
        <FormField id="emp-lastName" label="Primer apellido" required error={errors.lastName?.message}>
          {(control) => <input type="text" {...control} {...register('lastName')} />}
        </FormField>
        <FormField id="emp-secondLastName" label="Segundo apellido" error={errors.secondLastName?.message}>
          {(control) => <input type="text" {...control} {...register('secondLastName')} />}
        </FormField>
        <FormField id="emp-dpi" label="DPI" required error={errors.dpi?.message}>
          {(control) => <input type="text" {...control} {...register('dpi')} />}
        </FormField>
        <FormField
          id="emp-birthDate"
          label="Fecha de nacimiento"
          required
          hint="La persona debe tener entre 18 y 100 años."
          error={errors.birthDate?.message}
        >
          {(control) => <input type="date" {...control} {...register('birthDate')} />}
        </FormField>
        <FormField id="emp-phone" label="Teléfono" error={errors.phone?.message}>
          {(control) => <input type="tel" {...control} {...register('phone')} />}
        </FormField>
        <FormField id="emp-email" label="Correo electrónico" error={errors.email?.message}>
          {(control) => <input type="email" {...control} {...register('email')} />}
        </FormField>
        <FormField id="emp-address" label="Dirección" required wide error={errors.address?.message}>
          {(control) => <textarea rows={2} {...control} {...register('address')} />}
        </FormField>
      </Fieldset>

      <Fieldset title="Datos laborales">
        <FormField id="emp-departmentId" label="Departamento" required error={errors.departmentId?.message}>
          {(control) => (
            <select
              {...control}
              {...register('departmentId', {
                onChange: (event) => {
                  const next = event.target.value as string;
                  const current = getValues('positionId');
                  const allowed = catalogs.positions.some(
                    (item) => item.id === current && item.departmentIds.includes(next),
                  );
                  if (current && !allowed) setValue('positionId', '');
                },
              })}
            >
              <option value="">Selecciona un departamento</option>
              {departmentOptions.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          )}
        </FormField>
        <FormField
          id="emp-positionId"
          label="Puesto"
          required
          error={errors.positionId?.message}
          hint="Solo se muestran los puestos habilitados en el departamento elegido."
        >
          {(control) => (
            <select {...control} disabled={departmentId === ''} {...register('positionId')}>
              <option value="">
                {departmentId === '' ? 'Primero elige un departamento' : 'Selecciona un puesto'}
              </option>
              {positionOptions.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          )}
        </FormField>
        <FormField
          id="emp-baseSalary"
          label="Salario base"
          required
          hint="Por ejemplo: 8500.00"
          error={errors.baseSalary?.message}
        >
          {(control) => <input type="text" inputMode="decimal" {...control} {...register('baseSalary')} />}
        </FormField>
        <FormField id="emp-hireDate" label="Fecha de ingreso" required error={errors.hireDate?.message}>
          {(control) => <input type="date" {...control} {...register('hireDate')} />}
        </FormField>
      </Fieldset>

      {issue && <ServerIssueAlert issue={issue} onRetry={() => void submit()} />}

      {info && (
        <p role="status" className="rounded-lg border border-slate-300 bg-slate-100 px-4 py-3 text-sm text-slate-800">
          {info}
        </p>
      )}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          to={cancelTo}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-center text-sm font-medium text-slate-700 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
          className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-60"
        >
          {isSubmitting ? 'Guardando…' : saveLabel}
        </button>
      </div>
    </form>
  );
}

export default EmployeeForm;