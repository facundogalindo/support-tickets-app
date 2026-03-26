
type TicketFormProps = {
  title: string;
  description: string;
  priority: string;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
  setDescription: React.Dispatch<React.SetStateAction<string>>;
  setPriority: React.Dispatch<React.SetStateAction<string>>;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  formError: string;
};

function TicketForm({
  title,
  description,
  priority,
  setTitle,
  setDescription,
  setPriority,
  handleSubmit,
  formError
}: TicketFormProps) {
  return (
    <form onSubmit={handleSubmit}>
      <h2>Crear ticket</h2>
      {formError && <p className="form-error">{formError}</p>}

      <input
        type="text"
        placeholder="Título"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        placeholder="Descripción"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <select value={priority} onChange={(e) => setPriority(e.target.value)}>
        <option value="baja">Baja</option>
        <option value="media">Media</option>
        <option value="alta">Alta</option>
      </select>

      <button type="submit" className="btn btn-primary">
        Crear ticket
      </button>
    </form>
  );
}

export default TicketForm;