import { useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { MultiSelect } from 'react-multi-select-component';
import {
  MdAdd,
  MdAutorenew,
  MdRemoveRedEye,
  MdPassword,
  MdSupervisorAccount
} from 'react-icons/md';
import { Ring } from '@uiball/loaders';
import { useLocation, useNavigate } from 'react-router-dom';
import ROLES from '../../config/roles';
import styles from '../../App.module.css';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';

export default function NewUserFrom() {
  const navigate = useNavigate();
  const location = useLocation();
  const axiosPrivate = useAxiosPrivate();
  const messageRef = useRef();
  const [passwordType, setPasswordType] = useState('type');
  const [isloading, setIsloading] = useState(false);
  const [message, setMessage] = useState(null);
  const schema = yup.object().shape({
    username: yup.string().min(4).required('Username is required'),
    email: yup.string().email('Invalid email').required('Email is required'),
    password: yup.string().min(6, 'Min 6 characters').required('Password is required'),
    // confirmationPassword: yup.string().oneOf([yupref("password"), null]),
    roles: yup
      .array()
      .min(1, 'Please select at least one role')
      .required('Required: Please select at least one role')
  });
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema)
  });
  const onSubmit = async (data) => {
    setIsloading(true);
    setMessage(null);
    const newRoles = data?.roles.map((element) => element.value);
    await axiosPrivate
      .post('/users', { ...data, roles: newRoles })
      .then((result) => {
        setIsloading(false);
        setMessage(result?.data?.message);
        navigate(location.state?.from?.pathname || '/dash/users', {
          replace: true
        });
      })
      .catch((err) => {
        if (!err?.response?.status) {
          setMessage(err?.response?.statusText ? err?.response?.statusText : 'No server response');
        } else if (err?.response?.status === 409) {
          setMessage('Username exist already');
        } else if (err.status === 401) {
          setMessage('Unauthorized');
        } else {
          setMessage(err?.response?.statusText);
        }
        setIsloading(false);
      });
  };

  if (isloading) return <p>Loading ...</p>;
  return (
    <section>
      <div className={styles.center}>
        <MdSupervisorAccount size={30} style={{ marginRight: 10 }} />
        <h1>Singup</h1>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form__container}>
        <div className={styles.form__control__container}>
          <label htmlFor="username">Username</label>
          <input {...register('username')} type="text" />
        </div>
        {errors?.username && <p>{errors?.username?.message}</p>}
        <div className={styles.form__control__container}>
          <label htmlFor="password">Password</label>
          <div
            className={styles.center}
            style={{
              position: 'relative',
              border: '2px solid',
              borderRadius: '4px'
            }}>
            <input
              style={{
                border: 'none',
                borderRadius: 0,
                outline: 'none'
              }}
              type={passwordType ? 'password' : 'text'}
              {...register('password')}
            />
            <div
              style={{
                cursor: 'pointer',
                position: 'absolute',
                width: 20,
                padding: 5,
                right: 0,
                border: 'none'
              }}
              aria-hidden="true"
              onClick={() => setPasswordType((prev) => !prev)}>
              {passwordType ? <MdPassword /> : <MdRemoveRedEye />}
            </div>
          </div>
        </div>
        {errors?.password && <p>{errors?.password?.message}</p>}
        <div className={styles.form__control__container}>
          <label htmlFor="email">Email</label>
          <input {...register('email')} type="text" />
        </div>
        {errors?.email && <p>{errors?.email?.message}</p>}
        <div className={styles.form__control__container}>
          <label htmlFor="roles">Roles</label>
          <div
            style={{
              width: '210px'
            }}>
            <Controller
              control={control}
              name="roles"
              render={({ field: { onChange, value } }) => (
                <MultiSelect
                  options={ROLES}
                  value={value || []}
                  onChange={onChange}
                  labelledBy="Select"
                  disableSearch
                  hasSelectAll={false}
                />
              )}
            />
          </div>
        </div>
        {errors?.roles && <p>{errors?.roles?.message}</p>}
        <div className={styles.form__control__container}>
          <button type="submit" disabled={isloading} className={styles.button}>
            {!isloading ? (
              <div className={styles.center}>
                <MdAdd size={30} style={{ marginRight: 10 }} />
                Add
              </div>
            ) : (
              <div className={styles.center}>
                <Ring size={18} color="white" />
              </div>
            )}
          </button>
          <button type="button" onClick={() => reset()} className={styles.button}>
            <div className={styles.center}>
              <MdAutorenew size={30} style={{ marginRight: 10 }} />
              Reset
            </div>
          </button>
        </div>
        <p ref={messageRef} aria-live="assertive">
          {message && JSON.stringify(message)}
        </p>
      </form>
    </section>
  );
}
